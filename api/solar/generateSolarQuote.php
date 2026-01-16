<?php

declare(strict_types=1);

require_once __DIR__ . '/../ApiHelper.php';

try {
    $conn = getDbConnection();
    $input = getJsonInput();

    $analysisData = $input['analysisData'] ?? null;
    if (!is_array($analysisData)) {
        sendError(400, 'Analysis data is required');
    }

    $summary = $analysisData['summary'] ?? null;
    if (!is_array($summary)) {
        sendError(400, 'Invalid analysis summary');
    }

    $customerName = (string)($input['customerName'] ?? '');
    $customerEmail = (string)($input['customerEmail'] ?? '');

    if ($customerName === '' || $customerEmail === '') {
        sendError(400, 'Customer name and email are required');
    }

    $matchedItems = matchSolarProducts($conn, $summary);
    if (count($matchedItems) === 0) {
        sendError(400, 'No matching products found for this recommendation');
    }

    $vatRate = 16.0;

    $subtotal = 0.0;
    foreach ($matchedItems as $item) {
        $subtotal += $item['quantity'] * $item['price'];
    }

    $taxAmount = (($subtotal) * $vatRate) / 100.0;
    $total = $subtotal + $taxAmount;

    // Persist via existing quotations tables + generate PDF
    // Insert using quote_number as primary key (daily sequential: YYYYMMDD-###)
    $attempts = 0;
    $maxAttempts = 5;
    $quoteNumber = '';
    $today = date('Ymd');
    $prefix = $today . '-';
    $seq = 1;
    $maxStmt = $conn->prepare('SELECT MAX(quote_number) AS max_q FROM quotations WHERE quote_number LIKE ?');
    if (!$maxStmt) {
        throw new Exception('Failed to prepare quotation sequence query');
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

        $stmt = $conn->prepare("INSERT INTO quotations (quote_number, customer_name, customer_email, file_path) VALUES (?, ?, ?, '')");
        if (!$stmt) {
            throw new Exception('Failed to prepare quotation insert');
        }
        $stmt->bind_param('sss', $quoteNumber, $customerName, $customerEmail);
        $ok = $stmt->execute();
        $errno = $stmt->errno;
        $stmt->close();

        if ($ok) {
            break;
        }

        // Duplicate primary key: retry (possible concurrent request)
        if ($errno === 1062 && $attempts < $maxAttempts) {
            usleep(200000);
            $seq++;
            continue;
        }

        throw new Exception('Failed to create quotation');
    }

    $itemStmt = $conn->prepare("INSERT INTO quote_items (quote_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)");
    foreach ($matchedItems as $item) {
        $productId = (int)($item['product_id'] ?? 0);
        $quantity = (int)$item['quantity'];
        $unitPrice = (float)$item['price'];
        $totalPrice = $quantity * $unitPrice;
        // quote_id(string), product_id(int), quantity(int), unit_price(double), total_price(double)
        $itemStmt->bind_param('siidd', $quoteNumber, $productId, $quantity, $unitPrice, $totalPrice);
        $itemStmt->execute();
    }
    $itemStmt->close();

    // Premium-styled HTML for PDF (Dompdf renders CSS better when inline and simple)
    $companyName = 'SUNLEAF TECHNOLOGIES';
    $companyTagline = 'Solar Energy Solutions';
    $companyEmail = 'novagrouke@gmail.com';
    $companyPhone = '+254 712 616546';
    $companyAddress = '00100-17902 NAIROBI, Kenya';
    $companyWebsite = 'www.sunleaaftechnologies.co.ke';
    $preparedBy = 'Sunleaf Technologies';
    $referenceDate = date('d/m/Y');

    $rowsHtml = '';
    foreach ($matchedItems as $item) {
        $lineTotal = $item['quantity'] * $item['price'];
        $rowsHtml .= '<tr>';
        $rowsHtml .= '<td>';
        $rowsHtml .= '<div class="item-title">' . htmlspecialchars($item['name']) . '</div>';
        $rowsHtml .= '<div class="item-sub">' . htmlspecialchars($item['description']) . '</div>';
        $rowsHtml .= '</td>';
        $rowsHtml .= '<td class="center">' . (int)$item['quantity'] . '</td>';
        $rowsHtml .= '<td> KES ' . number_format((float)$item['price'], 2) . '</td>';
        $rowsHtml .= '<td class="right"><strong>KES ' . number_format((float)$lineTotal, 2) . '</strong></td>';
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
    $html .= '<div class="totRow"><span class="l">VAT (' . htmlspecialchars((string)$vatRate) . '%):</span><span class="r">KES ' . number_format((float)$taxAmount, 2) . '</span></div>';
    $html .= '<div class="totRow grand"><span class="l">Grand Total:</span><span class="r">KES ' . number_format((float)$total, 2) . '</span></div>';
    $html .= '</div></div>';

    $html .= '<div class="note"><div class="noteBox"><strong>Note:</strong> I hope that this offer is what you are looking for. I am available to provide any additional information you may require.<br><br><strong>Best regards,</strong><br>' . htmlspecialchars($preparedBy) . '</div></div>';

    $html .= '<div class="signature"><div class="sigBox">';
    $html .= '<div class="sigTitle">Client Approval</div>';
    $html .= '<table><tr><td style="width:50%;padding-right:10px;"><div class="sigRow"><div class="sigLabel">Name</div><div class="line"></div></div></td><td style="width:50%;padding-left:10px;"><div class="sigRow"><div class="sigLabel">Date</div><div class="line"></div></div></td></tr>';
    $html .= '<tr><td style="width:50%;padding-right:10px;"><div class="sigRow"><div class="sigLabel">Signature</div><div class="line"></div></div></td><td style="width:50%;padding-left:10px;"><div class="sigRow"><div class="sigLabel">Location</div><div class="line"></div></div></td></tr></table>';
    $html .= '</div></div>';

    $html .= '<div class="disclaimer"><strong>Disclaimer:</strong> This quotation is non-binding. Final sizing and installation must be verified by a qualified solar technician.</div>';
    $html .= '</div>';
    $html .= '</body></html>';

    // Use dompdf if available (existing createQuote uses it)
    $pdfPathRelative = '';
    $autoload = __DIR__ . '/../vendor/autoload.php';
    if (file_exists($autoload)) {
        require_once $autoload;
        if (class_exists('Dompdf\\Dompdf')) {
            $dompdf = new Dompdf\Dompdf();
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();

            $filename = "solar_quote_{$quoteNumber}.pdf";
            $folder = __DIR__ . '/../../quotes/';
            if (!is_dir($folder)) {
                mkdir($folder, 0755, true);
            }
            $pdfPath = $folder . $filename;
            file_put_contents($pdfPath, $dompdf->output());

            $pdfPathRelative = 'quotes/' . $filename;
            $updateStmt = $conn->prepare('UPDATE quotations SET file_path = ? WHERE quote_number = ?');
            $updateStmt->bind_param('ss', $pdfPathRelative, $quoteNumber);
            $updateStmt->execute();
            $updateStmt->close();
        }
    }

    sendSuccess([
        'data' => [
            'quote_id' => $quoteNumber,
            'quote_number' => $quoteNumber,
            'customer_name' => $customerName,
            'customer_email' => $customerEmail,
            'items' => $matchedItems,
            'subtotal' => round($subtotal, 2),
            'vat_rate' => $vatRate,
            'vat_amount' => round($taxAmount, 2),
            'total' => round($total, 2),
            'file_path' => $pdfPathRelative,
        ]
    ]);
} catch (Exception $e) {
    sendError(400, $e->getMessage());
}

function matchSolarProducts(mysqli $conn, array $summary): array
{
    // NOTE: Your products schema doesn't have capacity fields.
    // We'll do best-effort matching using category + keyword search in name/description/specifications.

    $items = [];

    $invKw = (int)($summary['recommendedInverterKW'] ?? 0);
    $batKwh = (int)($summary['recommendedBatteryKWh'] ?? 0);
    $solarKw = (int)($summary['recommendedSolarKW'] ?? 0);

    // Inverter
    $inverter = findProductByKeyword($conn, ['inverter'], ['inverter', (string)$invKw . 'kw', (string)$invKw . ' kw']);
    if ($inverter) {
        $items[] = [
            'product_id' => (int)$inverter['id'],
            'name' => (string)$inverter['name'],
            'description' => 'Inverter recommendation: ' . $invKw . ' kW',
            'quantity' => 1,
            'price' => (float)$inverter['price'],
        ];
    }

    // Lithium battery
    $battery = findProductByKeyword($conn, ['battery', 'batteries', 'lithium battery', 'lithium'], ['lithium', 'lifepo4', 'battery', (string)$batKwh . 'kwh', (string)$batKwh . ' kwh']);
    if ($battery) {
        $items[] = [
            'product_id' => (int)$battery['id'],
            'name' => (string)$battery['name'],
            'description' => 'Lithium battery storage recommendation: ' . $batKwh . ' kWh',
            'quantity' => 1,
            'price' => (float)$battery['price'],
        ];
    }

    // Solar panels
    $panel = findProductByKeyword($conn, ['solar panel', 'panel', 'panels'], ['panel', 'solar', 'pv', '450w', '550w']);
    if ($panel) {
        // crude quantity: assume 450W per panel
        $panelQty = (int)ceil((max(1, $solarKw) * 1000) / 450);
        $items[] = [
            'product_id' => (int)$panel['id'],
            'name' => (string)$panel['name'],
            'description' => 'Solar PV recommendation: ' . $solarKw . ' kW (approx. ' . $panelQty . ' panels)',
            'quantity' => $panelQty,
            'price' => (float)$panel['price'],
        ];
    }

    // Basic accessories (optional best-effort)
    $accessory = findProductByKeyword($conn, ['accessory', 'mounting', 'cable', 'breaker'], ['mount', 'cable', 'mc4', 'breaker', 'combiner']);
    if ($accessory) {
        $items[] = [
            'product_id' => (int)$accessory['id'],
            'name' => (string)$accessory['name'],
            'description' => 'Basic installation accessory',
            'quantity' => 1,
            'price' => (float)$accessory['price'],
        ];
    }

    return $items;
}

function findProductByKeyword(mysqli $conn, array $categoryHints, array $keywords): ?array
{
    $where = [];
    $params = [];
    $types = '';

    // category hint match (optional)
    if (count($categoryHints) > 0) {
        $catLike = [];
        foreach ($categoryHints as $hint) {
            $catLike[] = 'LOWER(category) LIKE ?';
            $params[] = '%' . strtolower($hint) . '%';
            $types .= 's';
        }
        $where[] = '(' . implode(' OR ', $catLike) . ')';
    }

    // keyword match across name/description/specifications
    $kwLike = [];
    foreach ($keywords as $kw) {
        $kwLike[] = '(LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(specifications) LIKE ?)';
        $params[] = '%' . strtolower($kw) . '%';
        $params[] = '%' . strtolower($kw) . '%';
        $params[] = '%' . strtolower($kw) . '%';
        $types .= 'sss';
    }
    $where[] = '(' . implode(' OR ', $kwLike) . ')';

    $sql = 'SELECT id, name, price, category, description, specifications, stock_quantity FROM products WHERE ' . implode(' AND ', $where) . ' ORDER BY stock_quantity DESC, id DESC LIMIT 1';

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        return null;
    }

    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : null;
    $stmt->close();

    return $row ?: null;
}
