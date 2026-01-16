<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../vendor/autoload.php';
require './connection.php'; //database connection

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $quoteId = $data['quote_id'] ?? null;

    if (!$quoteId) {
        echo json_encode(['error' => 'Quote ID is required']);
        exit;
    }

    // Fetch quote details from database
    $stmt = $conn->prepare("SELECT * FROM quotations WHERE quote_id = ?");
    $stmt->bind_param("i", $quoteId);
    $stmt->execute();
    $quoteResult = $stmt->get_result();

    if ($quoteResult->num_rows === 0) {
        echo json_encode(['error' => 'Quote not found']);
        exit;
    }

    $quote = $quoteResult->fetch_assoc();

    // Optional: fetch items if you have a related table
 $itemStmt = $conn->prepare("SELECT * FROM quote_items WHERE quote_id = ?");

    $itemStmt->bind_param("i", $quoteId);
    $itemStmt->execute();
    $itemsResult = $itemStmt->get_result();

    $itemsHtml = '';
    $total = 0;
    while ($item = $itemsResult->fetch_assoc()) {
        $subtotal = $item['quantity'] * $item['price'];
        $total += $subtotal;
        $itemsHtml .= "
          <tr>
            <td style='padding: 8px; border: 1px solid #eee;'>{$item['item_name']}</td>
            <td style='padding: 8px; border: 1px solid #eee;'>{$item['quantity']}</td>
            <td style='padding: 8px; border: 1px solid #eee;'>KSh {$item['price']}</td>
            <td style='padding: 8px; border: 1px solid #eee;'>KSh {$subtotal}</td>
          </tr>
        ";
    }

    $mail = new PHPMailer(true);

    try {
        // SMTP settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com'; // replace with your SMTP
        $mail->SMTPAuth = true;
        $mail->Username = 'elanwalton@gmail.com';
        $mail->Password = 'mcqa eozj bepo xsgf'; 
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        // Email setup
        $mail->setFrom('elanwalton@gmail.com', 'Sunleaf Technologies');
        $mail->addAddress($quote['customer_email'], $quote['customer_name']);

        $mail->isHTML(true);
        $mail->Subject = 'Your Quotation from Sunleaf Technologies';

        $mail->Body = "
          <div style='font-family: Arial, sans-serif; color: #333; padding: 20px;'>
            <div style='max-width: 700px; margin: auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);'>
              <div style='background-color: #700000; padding: 20px; color: #fff; border-top-left-radius: 8px; border-top-right-radius: 8px;'>
                <h2 style='margin: 0;'>Sunleaf Technologies</h2>
                <p style='margin: 5px 0 0;'>Your Quotation is Ready</p>
              </div>
              <div style='padding: 20px;'>
                <p>Hi <strong>{$quote['customer_name']}</strong>,</p>
                <p>Thank you for considering Sunleaf Tech. Here are your quotation details:</p>

                <table style='width: 100%; margin: 15px 0; border-collapse: collapse;'>
                  <tr>
                    <td style='padding: 8px; border: 1px solid #eee;'><strong>Quote Number:</strong></td>
                    <td style='padding: 8px; border: 1px solid #eee;'>#{$quote['quote_id']}</td>
                  </tr>
                  <tr>
                    <td style='padding: 8px; border: 1px solid #eee;'><strong>Date Issued:</strong></td>
                    <td style='padding: 8px; border: 1px solid #eee;'>{$quote['created_at']}</td>
                  </tr>
                  <tr>
                    <td style='padding: 8px; border: 1px solid #eee;'><strong>Customer Email:</strong></td>
                    <td style='padding: 8px; border: 1px solid #eee;'>{$quote['customer_email']}</td>
                  </tr>
                </table>

                <h3 style='margin-top: 30px;'>Quote Items</h3>
                <table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>
                  <thead>
                    <tr style='background-color: #f5f5f5;'>
                      <th style='padding: 10px; border: 1px solid #ddd;'>Item</th>
                      <th style='padding: 10px; border: 1px solid #ddd;'>Quantity</th>
                      <th style='padding: 10px; border: 1px solid #ddd;'>Price</th>
                      <th style='padding: 10px; border: 1px solid #ddd;'>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {$itemsHtml}
                    <tr>
                      <td colspan='3' style='padding: 8px; border: 1px solid #eee; text-align: right;'><strong>Total:</strong></td>
                      <td style='padding: 8px; border: 1px solid #eee;'><strong>KSh {$total}</strong></td>
                    </tr>
                  </tbody>
                </table>

                <p style='margin-top: 30px;'>We’re excited to work with you. If you have any questions, just reply to this email.</p>
                <p style='margin: 20px 0 0;'>Warm regards,<br>Sunleaf Tech Team</p>
              </div>
              <div style='background-color: #f4f4f4; padding: 10px 20px; font-size: 12px; text-align: center; color: #777; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;'>
                © 2025 Sunleaf Technologies. All rights reserved.
              </div>
            </div>
          </div>
        ";

        $mail->send();
        echo json_encode(['success' => true, 'message' => 'Quote sent successfully.']);
    } catch (Exception $e) {
        echo json_encode(['error' => 'Email failed: ' . $mail->ErrorInfo]);
    }
} else {
    echo json_encode(['error' => 'Invalid request']);
}
?>
<!-- mcqa eozj bepo xsgf -->
