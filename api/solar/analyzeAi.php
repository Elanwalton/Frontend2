<?php

declare(strict_types=1);

require_once __DIR__ . '/../ApiHelper.php';
require_once __DIR__ . '/rateLimit.php';
require_once __DIR__ . '/DeepSeekClient.php';

try {
    rateLimitOrFail('solar_rate', 5);

    $input = getJsonInput();

    $appliances = trim((string)($input['appliances'] ?? ''));
    $backupDays = (int)($input['backupDays'] ?? 1);

    if ($backupDays < 1) {
        $backupDays = 1;
    }
    if ($backupDays > 3) {
        $backupDays = 3;
    }

    if ($appliances === '') {
        sendError(400, 'Appliances input is required');
    }

    $analysis = null;
    $usedFallback = false;
    $fallbackDisabled = strtolower(trim((string)($_ENV['AI_FALLBACK_DISABLED'] ?? ''))) === 'true';

    try {
        $deepseekKey = trim((string)($_ENV['DEEPSEEK_API_KEY'] ?? ''));
        $client = new DeepSeekClient($deepseekKey);
        $analysis = $client->analyzeAppliances($appliances, $backupDays);
    } catch (Exception $aiError) {
        if ($fallbackDisabled) {
            throw $aiError;
        }

        // Fallback to local conservative estimator when AI is unavailable (e.g. insufficient balance)
        $usedFallback = true;
        $analysis = analyzeAppliancesLocally($appliances, $backupDays);
        $analysis['assumptions'] = ($analysis['assumptions'] ?? 'Conservative estimates applied.') . ' (AI unavailable; used local estimator)';
        $analysis['_ai_error'] = $aiError->getMessage();
    }

    // Add metadata
    $analysis['analysisId'] = uniqid('analysis_', true);
    $analysis['timestamp'] = date('c');
    $analysis['usedFallback'] = $usedFallback;

    sendSuccess(['data' => $analysis]);
} catch (Exception $e) {
    // Do not leak sensitive details
    sendError(400, $e->getMessage());
}

function analyzeAppliancesLocally(string $appliancesText, int $backupDays): array
{
    // Parse a free-text list into simple appliance tokens.
    $normalized = strtolower($appliancesText);

    // Very lightweight tokenization: split by commas/newlines.
    $parts = preg_split('/[\n,]+/', $normalized) ?: [];

    // Power database (watts + default hours/day)
    $db = [
        'refrigerator' => ['watts' => 150, 'hours' => 24],
        'fridge' => ['watts' => 150, 'hours' => 24],
        'freezer' => ['watts' => 100, 'hours' => 24],
        'tv' => ['watts' => 100, 'hours' => 6],
        'television' => ['watts' => 100, 'hours' => 6],
        'laptop' => ['watts' => 65, 'hours' => 8],
        'desktop' => ['watts' => 200, 'hours' => 8],
        'computer' => ['watts' => 200, 'hours' => 8],
        'led light' => ['watts' => 10, 'hours' => 8],
        'light' => ['watts' => 10, 'hours' => 8],
        'fan' => ['watts' => 75, 'hours' => 10],
        'air conditioner' => ['watts' => 1500, 'hours' => 8],
        'ac' => ['watts' => 1500, 'hours' => 8],
        'washing machine' => ['watts' => 500, 'hours' => 1],
        'microwave' => ['watts' => 1000, 'hours' => 0.5],
        'router' => ['watts' => 15, 'hours' => 24],
        'wifi' => ['watts' => 15, 'hours' => 24],
        'water pump' => ['watts' => 750, 'hours' => 2],
        'pump' => ['watts' => 750, 'hours' => 2],
    ];

    $appliances = [];
    $totalPeakLoadWatts = 0.0;
    $totalDailyKWh = 0.0;

    foreach ($parts as $raw) {
        $raw = trim($raw);
        if ($raw === '') continue;

        $qty = 1;
        if (preg_match('/\b(\d+)\b/', $raw, $m)) {
            $qty = max(1, (int)$m[1]);
        }

        $matchKey = null;
        foreach ($db as $key => $_) {
            if (strpos($raw, $key) !== false) {
                $matchKey = $key;
                break;
            }
        }

        $watts = 50;
        $hours = 4;

        if ($matchKey !== null) {
            $watts = (float)$db[$matchKey]['watts'];
            $hours = (float)$db[$matchKey]['hours'];
        }

        $dailyKWh = ($watts * $hours * $qty) / 1000.0;

        $appliances[] = [
            'name' => ucwords($matchKey ?? $raw),
            'quantity' => $qty,
            'estimatedWatts' => (int)$watts,
            'hoursPerDay' => $hours,
            'dailyKWh' => round($dailyKWh, 2),
        ];

        $totalPeakLoadWatts += ($watts * $qty);
        $totalDailyKWh += $dailyKWh;
    }

    // Apply margins and compute system sizing
    $peakLoadWatts = $totalPeakLoadWatts * 1.25;
    $dailyKWhWithMargin = $totalDailyKWh * 1.2;
    $recommendedInverterKW = (int)ceil($peakLoadWatts / 1000.0);
    $recommendedBatteryKWh = (int)ceil($dailyKWhWithMargin * max(1, $backupDays) * 1.2);

    $sunHours = 5.5;
    $recommendedSolarKW = (int)ceil(($dailyKWhWithMargin * 1.3) / $sunHours);

    return [
        'appliances' => $appliances,
        'summary' => [
            'totalPeakLoadWatts' => (int)round($totalPeakLoadWatts),
            'totalDailyKWh' => round($totalDailyKWh, 2),
            'peakLoadWatts' => (int)round($peakLoadWatts),
            'dailyKWh' => round($dailyKWhWithMargin, 2),
            'recommendedInverterKW' => $recommendedInverterKW,
            'recommendedBatteryKWh' => $recommendedBatteryKWh,
            'recommendedSolarKW' => $recommendedSolarKW,
            'backupDays' => max(1, $backupDays),
            'sunHoursPerDay' => $sunHours,
        ],
        'assumptions' => 'Conservative estimates with safety margins applied.',
    ];
}
