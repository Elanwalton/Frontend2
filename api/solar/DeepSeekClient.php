<?php

declare(strict_types=1);

final class DeepSeekClient
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct(string $apiKey, string $baseUrl = 'https://api.deepseek.com')
    {
        $this->apiKey = $apiKey;
        $this->baseUrl = rtrim($baseUrl, '/');

        if (!$this->apiKey) {
            throw new Exception('DeepSeek API key is not configured');
        }
    }

    public function analyzeAppliances(string $userInput, int $backupDays = 1): array
    {
        $prompt = $this->buildPrompt($userInput, $backupDays);

        $endpoint = $this->resolveChatCompletionsEndpoint();
        $ch = curl_init($endpoint);
        if (!$ch) {
            throw new Exception('Failed to initialize HTTP client');
        }

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->apiKey,
            ],
            CURLOPT_POSTFIELDS => json_encode([
                'model' => 'deepseek-chat',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert energy consultant. Always respond with valid JSON only, no markdown or explanations.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'temperature' => 0.3,
                'response_format' => ['type' => 'json_object'],
            ]),
            CURLOPT_TIMEOUT => 30,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($response === false) {
            $err = curl_error($ch);
            curl_close($ch);
            throw new Exception('DeepSeek request failed: ' . $err);
        }

        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception('DeepSeek API error: ' . $response);
        }

        $data = json_decode($response, true);
        if (!is_array($data)) {
            throw new Exception('DeepSeek API returned invalid JSON');
        }

        $content = $data['choices'][0]['message']['content'] ?? '';
        $analysis = json_decode($content, true);

        if (!is_array($analysis)) {
            throw new Exception('DeepSeek analysis parse failed');
        }

        return $this->applyBusinessRules($analysis, $backupDays);
    }

    private function resolveChatCompletionsEndpoint(): string
    {
        // Support both:
        // - baseUrl = https://api.deepseek.com  => https://api.deepseek.com/v1/chat/completions
        // - baseUrl = https://router.requesty.ai/v1 => https://router.requesty.ai/v1/chat/completions
        $base = $this->baseUrl;

        if (preg_match('~/v1$~', $base)) {
            return $base . '/chat/completions';
        }

        return $base . '/v1/chat/completions';
    }

    private function buildPrompt(string $userInput, int $backupDays): string
    {
        $userInput = trim($userInput);

        return <<<PROMPT
Analyze this appliance list and calculate energy requirements.

User Input: "{$userInput}"

Return ONLY this JSON structure (no markdown, no explanations):
{
  "appliances": [
    {
      "name": "Refrigerator",
      "quantity": 1,
      "estimatedWatts": 150,
      "hoursPerDay": 24,
      "dailyKWh": 3.6
    }
  ],
  "summary": {
    "totalPeakLoadWatts": 0,
    "totalDailyKWh": 0
  },
  "assumptions": "Conservative estimates with 25% safety margin applied."
}

Use these standard ratings:
- Refrigerator: 150W, 24h/day
- TV: 100W, 6h/day
- Laptop: 65W, 8h/day
- LED Light: 10W, 8h/day
- Fan: 75W, 10h/day
- Air Conditioner: 1500W, 8h/day
- Washing Machine: 500W, 1h/day
- Microwave: 1000W, 0.5h/day
- Router/WiFi: 15W, 24h/day
- Desktop Computer: 200W, 8h/day
- Water Pump: 750W, 2h/day

Be conservative. Apply 25% safety margin to peak loads.

Also consider backupDays={$backupDays} for battery recommendation.
PROMPT;
    }

    private function applyBusinessRules(array $analysis, int $backupDays): array
    {
        $summary = $analysis['summary'] ?? [];

        $totalPeak = (float)($summary['totalPeakLoadWatts'] ?? 0);
        $totalDaily = (float)($summary['totalDailyKWh'] ?? 0);

        $peakLoad = $totalPeak * 1.25; // 25% safety margin
        $dailyKWh = $totalDaily * 1.2; // 20% margin

        $inverterKW = (int)ceil($peakLoad / 1000);
        $batteryKWh = (int)ceil($dailyKWh * $backupDays * 1.2);

        $sunHours = 5.5;
        $solarKW = (int)ceil(($dailyKWh * 1.3) / $sunHours);

        if (!isset($analysis['summary']) || !is_array($analysis['summary'])) {
            $analysis['summary'] = [];
        }

        $analysis['summary']['peakLoadWatts'] = (int)round($peakLoad);
        $analysis['summary']['dailyKWh'] = (float)round($dailyKWh, 2);
        $analysis['summary']['recommendedInverterKW'] = $inverterKW;
        $analysis['summary']['recommendedBatteryKWh'] = $batteryKWh;
        $analysis['summary']['recommendedSolarKW'] = $solarKW;
        $analysis['summary']['backupDays'] = $backupDays;
        $analysis['summary']['sunHoursPerDay'] = $sunHours;

        return $analysis;
    }
}
