<?php
require_once __DIR__ . '/ApiHelper.php';
require_once __DIR__ . '/auth-middleware.php';

$conn = getDbConnection();
$auth = $GLOBALS['_AUTH_USER'] ?? null;

if (!$auth) {
  sendError(401, 'Unauthorized');
}

if (($auth['role'] ?? '') !== 'admin') {
  sendError(403, 'Forbidden');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  sendError(405, 'Method not allowed');
}

// Prefer api/vendor/autoload.php (repo vendor lives under api/)
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
  error_log('createQuote missing autoload: ' . $autoloadPath);
  sendError(500, 'PDF service unavailable');
}

require_once $autoloadPath;

use Dompdf\Dompdf;

// Parse JSON input
$data = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
  sendError(400, 'Invalid JSON payload');
}

// Validate required fields
if (
  empty($data['customer_name']) ||
  empty($data['customer_email']) ||
  empty($data['items']) ||
  !is_array($data['items'])
) {
  sendError(400, 'Missing required fields');
}

// Extract data
$customerName = $data['customer_name'];
$customerEmail = $data['customer_email'];
$items = $data['items'];
$tax = isset($data['tax']) ? floatval($data['tax']) : 0;
$discount = isset($data['discount']) ? floatval($data['discount']) : 0;
$notes = $data['notes'] ?? '';

// Generate a quote number (YYYYMMDD-###)
$today = date('Ymd');
$prefix = $today . '-';
$seq = 1;
$attempts = 0;
$maxAttempts = 5;

$maxStmt = $conn->prepare('SELECT MAX(quote_number) AS max_q FROM quotations WHERE quote_number LIKE ?');
if (!$maxStmt) {
  sendError(500, 'Failed to prepare quotation sequence query');
}
$like = $prefix . '%';
$maxStmt->bind_param('s', $like);
$maxStmt->execute();
$res = $maxStmt->get_result();
$row = $res ? $res->fetch_assoc() : null;
$maxStmt->close();

if ($row && !empty($row['max_q'])) {
  $maxQ = (string)$row['max_q'];
  $last = (int)substr($maxQ, strlen($prefix));
  $seq = max(1, $last + 1);
}

while (true) {
  $quoteNumber = $prefix . str_pad((string)$seq, 3, '0', STR_PAD_LEFT);
  // Quote numbers are stored as strings; still, handle potential duplicates in concurrent requests.
  $checkStmt = $conn->prepare('SELECT 1 FROM quotations WHERE quote_number = ? LIMIT 1');
  if (!$checkStmt) {
    sendError(500, 'Failed to prepare quote number validation');
  }
  $checkStmt->bind_param('s', $quoteNumber);
  $checkStmt->execute();
  $existsRes = $checkStmt->get_result();
  $exists = $existsRes && $existsRes->num_rows > 0;
  $checkStmt->close();

  if (!$exists) {
    break;
  }

  if ($attempts++ >= $maxAttempts) {
    sendError(500, 'Failed to allocate unique quote number');
  }
  $seq++;
}

// Set expiry date (30 days from now) and status
$expiryDate = date('Y-m-d', strtotime('+30 days'));
$status = 'pending';
$filePath = ''; // Will be updated after PDF generation

// Create subtotal and total
$subtotal = 0;
foreach ($items as $item) {
  $subtotal += $item['quantity'] * $item['price'];
}
$discountAmount = ($discount / 100) * $subtotal;
$taxAmount = (($subtotal - $discountAmount) * $tax) / 100;
$total = $subtotal - $discountAmount + $taxAmount;

// Step 1: Insert quote metadata into DB
try {
  $conn->begin_transaction();

  $stmt = $conn->prepare("INSERT INTO quotations (quote_number, customer_name, customer_email, file_path, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?)");
  if (!$stmt) {
    throw new Exception('DB prepare failed (insert quote): ' . $conn->error);
  }
  $stmt->bind_param("ssssss", $quoteNumber, $customerName, $customerEmail, $filePath, $expiryDate, $status);
  if (!$stmt->execute()) {
    throw new Exception('DB execute failed (insert quote): ' . $stmt->error);
  }
  $quoteId = (int)$stmt->insert_id;
  $stmt->close();

  // Determine whether quote_items.quote_id references quotations.id or quotations.quote_number
  $quoteItemsQuoteIdType = '';
  if ($qitRes = $conn->query("SHOW COLUMNS FROM quote_items LIKE 'quote_id'")) {
    $qitRow = $qitRes->fetch_assoc();
    $quoteItemsQuoteIdType = strtolower((string)($qitRow['Type'] ?? ''));
  }

  $quoteItemRefIsNumber = $quoteItemsQuoteIdType !== '' && (
    str_starts_with($quoteItemsQuoteIdType, 'varchar') ||
    str_starts_with($quoteItemsQuoteIdType, 'char') ||
    str_starts_with($quoteItemsQuoteIdType, 'text')
  );

  $quoteItemRef = $quoteItemRefIsNumber ? $quoteNumber : $quoteId;

  // Insert quote items into quote_items table
  $hasProductId = false;
  $hasUnitPrice = false;
  $hasTotalPrice = false;
  if ($colRes = $conn->query('SHOW COLUMNS FROM quote_items')) {
    while ($c = $colRes->fetch_assoc()) {
      $field = $c['Field'] ?? '';
      if ($field === 'product_id') $hasProductId = true;
      if ($field === 'unit_price') $hasUnitPrice = true;
      if ($field === 'total_price') $hasTotalPrice = true;
    }
  }
  if (!$hasProductId || !$hasUnitPrice || !$hasTotalPrice) {
    throw new Exception('quote_items schema mismatch (expected product_id, unit_price, total_price)');
  }

  // If user entered a custom product (not in products list), create a placeholder product row.
  $ensureProductStmt = null;
  try {
    $ensureProductStmt = $conn->prepare('INSERT INTO products (name, description, price, stock_quantity, category) VALUES (?, ?, ?, ?, ?)');
  } catch (Throwable $ignored) {
    $ensureProductStmt = null;
  }

  $itemSql = 'INSERT INTO quote_items (quote_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)';
  $itemStmt = $conn->prepare($itemSql);
  if (!$itemStmt) {
    throw new Exception('DB prepare failed (insert items): ' . $conn->error);
  }

  foreach ($items as $item) {
    $productId = (int)($item['product_id'] ?? $item['productId'] ?? 0);
    $itemName = (string)($item['description'] ?? $item['name'] ?? $item['item_name'] ?? '');
    $quantity = (int)($item['quantity'] ?? 0);
    $unitPrice = (float)($item['price'] ?? $item['unit_price'] ?? $item['unitPrice'] ?? 0);

    // If no product_id provided, try to create a placeholder product in DB.
    if ($productId <= 0) {
      $trimmedName = trim($itemName);
      if ($trimmedName === '') {
        throw new Exception('Item description is required');
      }

      // Try to find an existing product by exact name (case-insensitive)
      $findStmt = $conn->prepare('SELECT id FROM products WHERE LOWER(name) = LOWER(?) LIMIT 1');
      if ($findStmt) {
        $findStmt->bind_param('s', $trimmedName);
        $findStmt->execute();
        $res = $findStmt->get_result();
        $row = $res ? $res->fetch_assoc() : null;
        $findStmt->close();
        if ($row && isset($row['id'])) {
          $productId = (int)$row['id'];
        }
      }

      if ($productId <= 0) {
        if (!$ensureProductStmt) {
          throw new Exception('Custom products are not supported on this server (products table insert unavailable)');
        }
        $desc = (string)($item['description'] ?? '');
        $stockQty = 0;
        $category = 'Custom';
        $ensureProductStmt->bind_param('ssdis', $trimmedName, $desc, $unitPrice, $stockQty, $category);
        if (!$ensureProductStmt->execute()) {
          throw new Exception('Failed to create custom product: ' . $ensureProductStmt->error);
        }
        $productId = (int)$ensureProductStmt->insert_id;
      }
    }

    if ($quantity < 1 || $unitPrice < 0) {
      throw new Exception('Invalid quote item');
    }

    $totalPrice = $quantity * $unitPrice;

    if ($quoteItemRefIsNumber) {
      $itemStmt->bind_param('siidd', $quoteItemRef, $productId, $quantity, $unitPrice, $totalPrice);
    } else {
      $itemStmt->bind_param('iiidd', $quoteItemRef, $productId, $quantity, $unitPrice, $totalPrice);
    }
    if (!$itemStmt->execute()) {
      throw new Exception('DB execute failed (insert item): ' . $itemStmt->error);
    }
  }

  $itemStmt->close();
  if ($ensureProductStmt) {
    $ensureProductStmt->close();
  }

  // Generate PDF
  // Premium-styled HTML for PDF (keep CSS simple for dompdf)
  $companyName = 'SUNLEAF TECHNOLOGIES';
  $companyTagline = 'Solar Energy Solutions';
  $companyEmail = 'novagrouke@gmail.com';
  $companyPhone = '+254 712 616546';
  $companyAddress = '00100-17902 NAIROBI, Kenya';
  $companyWebsite = 'www.sunleaaftechnologies.co.ke';
  $preparedBy = 'Sunleaf Technologies';
  $referenceDate = date('d/m/Y');

  $rowsHtml = '';
  foreach ($items as $item) {
    $qty = (int)($item['quantity'] ?? 0);
    $pr = (float)($item['price'] ?? $item['unit_price'] ?? $item['unitPrice'] ?? 0);
    $lineTotal = $qty * $pr;
    $name = htmlspecialchars((string)($item['name'] ?? $item['description'] ?? ''));
    $desc = htmlspecialchars((string)($item['description'] ?? ''));
    if ($desc === $name) {
      $desc = '';
    }

    $rowsHtml .= '<tr>';
    $rowsHtml .= '<td>';
    $rowsHtml .= '<div class="item-title">' . $name . '</div>';
    if ($desc !== '') {
      $rowsHtml .= '<div class="item-sub">' . $desc . '</div>';
    }
    $rowsHtml .= '</td>';
    $rowsHtml .= '<td class="center">' . $qty . '</td>';
    $rowsHtml .= '<td> KES ' . number_format($pr, 2) . '</td>';
    $rowsHtml .= '<td class="right"><strong>KES ' . number_format($lineTotal, 2) . '</strong></td>';
    $rowsHtml .= '</tr>';
  }

  $html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>';
  $html .= '@page{margin:120px 28px 90px 28px;}';
  $html .= 'body{font-family:DejaVu Sans,Arial,sans-serif;font-size:12px;color:#1a202c;margin:0;padding:0;}';
  $html .= '.container{width:100%;}';
  $html .= '.watermarkStrip{position:fixed;left:0;right:0;bottom:0;height:44px;display:flex;align-items:center;justify-content:center;opacity:0.75;background:linear-gradient(135deg,#C8E6C9 0%,#C8E6C9 49.5%,#FFCCBC 50.5%,#FFCCBC 100%);}';
  $html .= '.watermarkText{font-size:20px;font-weight:500;letter-spacing:0.05em;color:#ffffff;text-align:center;}';
  $html .= '.topBanner{position:fixed;top:-100px;left:0;right:0;height:72px;padding:22px 0;background:linear-gradient(90deg, rgba(34,197,94,0.7) 0%, rgba(34,197,94,0.45) 50%, rgba(34,197,94,0.25) 100%);}';
  $html .= '.topBanner h2{margin:0;text-align:center;color:#fff;font-size:22px;font-weight:300;letter-spacing:1px;line-height:28px;}';
  $html .= '.header{background:#2a9d35;color:#fff;padding:28px 28px 22px;position:relative;}';
  $html .= '.badge{position:absolute;top:22px;right:22px;background:rgba(255,255,255,0.18);padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.25);}';
  $html .= '.badgeLabel{font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:0.9;margin-bottom:2px;}';
  $html .= '.badgeNumber{font-size:18px;font-weight:bold;}';
  $html .= '.companyName{font-size:20px;font-weight:bold;margin:0 0 4px;}';
  $html .= '.companyTagline{font-size:12px;opacity:0.95;margin:0 0 12px;}';
  $html .= '.contact{font-size:11px;opacity:0.95;}';
  $html .= '.contact div{margin:2px 0;}';
  $html .= '.infoGrid{background:#f7fafc;padding:22px 28px;border-bottom:1px solid #e2e8f0;}';
  $html .= '.infoCol{width:50%;vertical-align:top;}';
  $html .= '.infoTitle{font-size:10px;text-transform:uppercase;color:#718096;letter-spacing:1px;font-weight:bold;margin:0 0 10px;}';
  $html .= '.clientName{font-size:16px;font-weight:bold;margin:0 0 8px;}';
  $html .= '.detailRow{margin:4px 0;}';
  $html .= '.label{color:#718096;display:inline-block;width:120px;}';
  $html .= '.value{font-weight:bold;}';
  $html .= '.section{padding:22px 28px;}';
  $html .= '.sectionTitle{font-size:14px;font-weight:bold;margin:0 0 12px;}';
  $html .= 'table{width:100%;border-collapse:collapse;}';
  $html .= 'thead{background:#edf2f7;}';
  $html .= 'th{padding:10px 12px;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#4a5568;text-align:left;}';
  $html .= 'td{padding:12px;border-bottom:1px solid #e2e8f0;vertical-align:top;}';
  $html .= '.center{text-align:center;}';
  $html .= '.right{text-align:right;}';
  $html .= '.item-title{font-weight:bold;margin-bottom:3px;}';
  $html .= '.item-sub{color:#718096;font-size:11px;line-height:1.35;}';
  $html .= '.totals{background:#f7fafc;padding:18px 28px;border-top:2px solid #e2e8f0;}';
  $html .= '.totalsBox{width:260px;margin-left:auto;}';
  $html .= '.totRow{padding:6px 0;}';
  $html .= '.totRow span{display:inline-block;}';
  $html .= '.totRow .l{width:140px;color:#4a5568;}';
  $html .= '.totRow .r{width:120px;text-align:right;font-weight:bold;}';
  $html .= '.grand{border-top:2px solid #cbd5e0;margin-top:6px;padding-top:10px;font-size:14px;}';
  $html .= '.note{padding:14px 28px;}';
  $html .= '.noteBox{background:#edf2f7;border-left:4px solid #667eea;padding:12px;border-radius:4px;color:#4a5568;line-height:1.5;}';
  $html .= '.signature{padding:0 28px 18px;}';
  $html .= '.sigBox{background:#f7fafc;border:2px dashed #cbd5e0;border-radius:8px;padding:14px;}';
  $html .= '.sigTitle{font-weight:bold;margin:0 0 10px;}';
  $html .= '.sigRow{margin:10px 0;}';
  $html .= '.sigLabel{font-size:10px;color:#718096;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;}';
  $html .= '.line{border-bottom:1px solid #cbd5e0;height:18px;}';
  $html .= '.disclaimer{padding:0 28px 22px;color:#718096;font-size:11px;}';
  $html .= '</style></head><body>';
  $html .= '<div class="topBanner"><h2>Sustainable Power Solutions</h2></div>';
  $html .= '<div class="watermarkStrip"><div class="watermarkText">Sustainable Power Solutions</div></div>';
  $html .= '<div class="container">';
  $html .= '<div class="header">';
  $html .= '<div class="badge"><div class="badgeLabel">Quote</div><div class="badgeNumber">#' . htmlspecialchars($quoteNumber) . '</div></div>';
  $html .= '<div class="companyName">' . htmlspecialchars($companyName) . '</div>';
  $html .= '<div class="companyTagline">' . htmlspecialchars($companyTagline) . '</div>';
  $html .= '<div class="contact">';
  $html .= '<div>📧 ' . htmlspecialchars($companyEmail) . '</div>';
  $html .= '<div>📱 ' . htmlspecialchars($companyPhone) . '</div>';
  $html .= '<div>📍 ' . htmlspecialchars($companyAddress) . '</div>';
  $html .= '<div>🌐 ' . htmlspecialchars($companyWebsite) . '</div>';
  $html .= '</div>';
  $html .= '</div>';

  $html .= '<div class="infoGrid"><table><tr>';
  $html .= '<td class="infoCol">';
  $html .= '<div class="infoTitle">Client Information</div>';
  $html .= '<div class="clientName">' . htmlspecialchars($customerName) . '</div>';
  $html .= '<div class="detailRow"><span class="label">Email:</span> <span class="value">' . htmlspecialchars($customerEmail) . '</span></div>';
  $html .= '</td>';
  $html .= '<td class="infoCol">';
  $html .= '<div class="infoTitle">Quote Details</div>';
  $html .= '<div class="detailRow"><span class="label">Quote Number:</span> <span class="value">' . htmlspecialchars($quoteNumber) . '</span></div>';
  $html .= '<div class="detailRow"><span class="label">Reference Date:</span> <span class="value">' . htmlspecialchars($referenceDate) . '</span></div>';
  $html .= '<div class="detailRow"><span class="label">Prepared By:</span> <span class="value">' . htmlspecialchars($preparedBy) . '</span></div>';
  $html .= '</td>';
  $html .= '</tr></table></div>';

  $html .= '<div class="section">';
  $html .= '<div class="sectionTitle">Quote Items</div>';
  $html .= '<table><thead><tr><th>Description</th><th class="center">Qty</th><th>Unit Price</th><th class="right">Amount</th></tr></thead><tbody>';
  $html .= $rowsHtml;
  $html .= '</tbody></table>';
  $html .= '</div>';

  $html .= '<div class="totals"><div class="totalsBox">';
  $html .= '<div class="totRow"><span class="l">Subtotal:</span><span class="r">KES ' . number_format((float)$subtotal, 2) . '</span></div>';
  $html .= '<div class="totRow"><span class="l">Discount (' . htmlspecialchars((string)$discount) . '%):</span><span class="r">KES ' . number_format((float)$discountAmount, 2) . '</span></div>';
  $html .= '<div class="totRow"><span class="l">Tax (' . htmlspecialchars((string)$tax) . '%):</span><span class="r">KES ' . number_format((float)$taxAmount, 2) . '</span></div>';
  $html .= '<div class="totRow grand"><span class="l">Grand Total:</span><span class="r">KES ' . number_format((float)$total, 2) . '</span></div>';
  $html .= '</div></div>';

  if ($notes) {
    $html .= '<div class="note"><div class="noteBox"><strong>Notes:</strong><br>' . nl2br(htmlspecialchars($notes)) . '</div></div>';
  } else {
    $html .= '<div class="note"><div class="noteBox"><strong>Note:</strong> I hope that this offer is what you are looking for. I am available to provide any additional information you may require.<br><br><strong>Best regards,</strong><br>' . htmlspecialchars($preparedBy) . '</div></div>';
  }

  $html .= '<div class="signature"><div class="sigBox">';
  $html .= '<div class="sigTitle">Client Approval</div>';
  $html .= '<table><tr><td style="width:50%;padding-right:10px;"><div class="sigRow"><div class="sigLabel">Name</div><div class="line"></div></div></td><td style="width:50%;padding-left:10px;"><div class="sigRow"><div class="sigLabel">Date</div><div class="line"></div></div></td></tr>';
  $html .= '<tr><td style="width:50%;padding-right:10px;"><div class="sigRow"><div class="sigLabel">Signature</div><div class="line"></div></div></td><td style="width:50%;padding-left:10px;"><div class="sigRow"><div class="sigLabel">Location</div><div class="line"></div></div></td></tr></table>';
  $html .= '</div></div>';

  $html .= '<div class="disclaimer"><strong>Disclaimer:</strong> This quotation is non-binding. Final sizing and installation must be verified by a qualified technician.</div>';
  $html .= '</div>';
  $html .= '</body></html>';

  // (Rows and totals are assembled in the premium template above)

  $dompdf = new Dompdf();
  $dompdf->loadHtml($html);
  $dompdf->setPaper('A4', 'portrait');
  $dompdf->render();

  $safeQuoteNumber = preg_replace('/[^A-Za-z0-9\-_.]/', '_', (string)$quoteNumber);
  $filename = "quote_{$safeQuoteNumber}.pdf";
  $folder = __DIR__ . '/quotes/';
  if (!is_dir($folder)) {
    mkdir($folder, 0755, true);
  }
  $pdfPath = $folder . $filename;

  if (file_put_contents($pdfPath, $dompdf->output()) === false) {
    throw new Exception('Failed to write PDF');
  }

  // Update quote record with PDF path
  $filePathRelative = 'quotes/' . $filename;
  $hasQuoteIdPk = false;
  if ($qColRes = $conn->query('SHOW COLUMNS FROM quotations')) {
    while ($qc = $qColRes->fetch_assoc()) {
      $f = $qc['Field'] ?? '';
      if ($f === 'id') {
        $hasQuoteIdPk = false;
        break;
      }
      if ($f === 'quote_id') $hasQuoteIdPk = true;
    }
  }

  $updateWhere = $hasQuoteIdPk ? 'quote_id' : 'id';
  // If quote_items references quote_number, prefer updating by quote_number to keep identifiers consistent.
  if ($quoteItemRefIsNumber) {
    $updateWhere = 'quote_number';
  }
  $updateStmt = $conn->prepare("UPDATE quotations SET file_path = ? WHERE {$updateWhere} = ?");
  if (!$updateStmt) {
    throw new Exception('DB prepare failed (update file_path): ' . $conn->error);
  }
  if ($quoteItemRefIsNumber) {
    $updateStmt->bind_param('ss', $filePathRelative, $quoteNumber);
  } else {
    $updateStmt->bind_param('si', $filePathRelative, $quoteId);
  }
  if (!$updateStmt->execute()) {
    throw new Exception('DB execute failed (update file_path): ' . $updateStmt->error);
  }
  $updateStmt->close();

  $conn->commit();

  sendSuccess([
    'quote_id' => $quoteId,
    'quote_number' => $quoteNumber,
    'expiry_date' => $expiryDate,
    'status' => $status,
    'file_path' => $filePathRelative,
  ]);
} catch (Throwable $e) {
  if ($conn && $conn->errno === 0) {
    // no-op
  }
  try {
    $conn->rollback();
  } catch (Throwable $ignored) {
    // ignore rollback errors
  }
  error_log('createQuote error: ' . $e->getMessage());
  sendError(500, 'Failed to create quote');
}

