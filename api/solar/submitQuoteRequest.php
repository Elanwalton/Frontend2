<?php
/**
 * Submit Quote Request
 * Client-facing endpoint for submitting solar quote requests
 * No authentication required
 */

declare(strict_types=1);

require_once __DIR__ . '/../ApiHelper.php';

try {
    $conn = getDbConnection();
    $input = getJsonInput();

    // Validate required fields
    $appliances = (string)($input['appliances'] ?? '');
    $customerName = (string)($input['customerName'] ?? '');
    $customerEmail = (string)($input['customerEmail'] ?? '');
    $customerPhone = (string)($input['customerPhone'] ?? '');

    if ($appliances === '' || $customerName === '' || $customerEmail === '') {
        sendError(400, 'Appliances, customer name, and email are required');
    }

    // Validate email format
    if (!filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
        sendError(400, 'Invalid email address');
    }

    // Run AI analysis
    require_once __DIR__ . '/DeepSeekClient.php';
    
    $apiKey = $_ENV['DEEPSEEK_API_KEY'] ?? '';
    $fallbackDisabled = strtolower($_ENV['AI_FALLBACK_DISABLED'] ?? 'false') === 'true';
    $analysisResult = null;
    $aiError = null;

    if ($apiKey) {
        try {
            $client = new DeepSeekClient($apiKey);
            $analysisResult = $client->analyzeAppliances($appliances, 1); // Default 1 day backup
        } catch (Exception $e) {
            $aiError = $e->getMessage();
            error_log('AI Analysis failed: ' . $aiError);
            
            if ($fallbackDisabled) {
                sendError(500, 'AI analysis failed and fallback is disabled: ' . $aiError);
            }
        }
    } else {
        if ($fallbackDisabled) {
            sendError(500, 'AI service is not configured and fallback is disabled');
        }
    }

    // Default analysis if AI failed or service not configured
    if (!$analysisResult || !isset($analysisResult['summary'])) {
        $analysisResult = [
            'appliances' => [],
            'summary' => [
                'peakLoadWatts' => 0,
                'dailyKWh' => 0,
                'recommendedInverterKW' => 0,
                'recommendedBatteryKWh' => 0,
                'recommendedSolarKW' => 0,
                'backupDays' => 1
            ],
            'is_fallback' => true,
            'ai_error' => $aiError
        ];
    }


    // Generate request number (format: REQ-YYYYMMDD-###)
    $today = date('Ymd');
    $prefix = 'REQ-' . $today . '-';
    $seq = 1;

    $maxStmt = $conn->prepare('SELECT MAX(request_number) AS max_req FROM quote_requests WHERE request_number LIKE ?');
    if (!$maxStmt) {
        throw new Exception('Failed to prepare request number query');
    }
    $like = $prefix . '%';
    $maxStmt->bind_param('s', $like);
    $maxStmt->execute();
    $res = $maxStmt->get_result();
    $row = $res ? $res->fetch_assoc() : null;
    $maxStmt->close();

    if ($row && !empty($row['max_req'])) {
        $maxReq = (string)$row['max_req'];
        $last = (int)substr($maxReq, strlen($prefix));
        $seq = max(1, $last + 1);
    }

    $requestNumber = $prefix . str_pad((string)$seq, 3, '0', STR_PAD_LEFT);

    // Save quote request
    $analysisJson = json_encode($analysisResult);
    $status = 'pending';

    $stmt = $conn->prepare("INSERT INTO quote_requests (request_number, customer_name, customer_email, customer_phone, appliances, analysis_data, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        throw new Exception('Failed to prepare insert statement');
    }
    $stmt->bind_param('sssssss', $requestNumber, $customerName, $customerEmail, $customerPhone, $appliances, $analysisJson, $status);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to save quote request');
    }
    $requestId = (int)$stmt->insert_id;
    $stmt->close();

    // Check if AI quote generation is enabled
    $aiEnabled = true;
    $settingStmt = $conn->prepare("SELECT setting_value FROM admin_settings WHERE setting_key = 'ai_quote_generation_enabled' LIMIT 1");
    if ($settingStmt) {
        $settingStmt->execute();
        $settingRes = $settingStmt->get_result();
        $setting = $settingRes ? $settingRes->fetch_assoc() : null;
        $settingStmt->close();
        if ($setting) {
            $aiEnabled = strtolower($setting['setting_value']) === 'true';
        }
    }

    $aiQuoteId = null;

    // If AI is enabled, auto-generate quote
    if ($aiEnabled) {
        try {
            require_once __DIR__ . '/quoteHelpers.php';
            
            $quoteResult = generateQuoteFromAnalysis(
                $conn,
                $analysisResult,
                $customerName,
                $customerEmail,
                $requestId,
                true // is_ai_generated
            );
            
            if ($quoteResult && isset($quoteResult['quote_number'])) {
                $aiQuoteId = $quoteResult['quote_number'];
                
                // Update request with AI quote ID
                $updateStmt = $conn->prepare("UPDATE quote_requests SET ai_quote_id = ?, status = 'quoted' WHERE id = ?");
                if ($updateStmt) {
                    $updateStmt->bind_param('si', $aiQuoteId, $requestId);
                    $updateStmt->execute();
                    $updateStmt->close();
                }
            }
        } catch (Exception $e) {
            error_log('AI quote generation failed: ' . $e->getMessage());
            // Continue even if AI generation fails
        }
    }

    sendSuccess([
        'data' => [
            'request_id' => $requestId,
            'request_number' => $requestNumber,
            'status' => $status,
            'ai_enabled' => $aiEnabled,
            'ai_quote_generated' => $aiQuoteId !== null,
            'ai_quote_id' => $aiQuoteId,
            'message' => $aiEnabled 
                ? 'Your request has been submitted. Our AI has generated a preliminary quote which will be reviewed by our team before sending to you.'
                : 'Your request has been submitted. Our team will review it and send you a detailed quote soon.'
        ]
    ]);

} catch (Exception $e) {
    error_log('submitQuoteRequest error: ' . $e->getMessage());
    sendError(500, 'Failed to submit quote request');
}
