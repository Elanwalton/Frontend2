<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../ApiHelper.php';
$conn = getDbConnection();

// Enable CORS for API requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['appliances'])) {
        throw new Exception('Appliances list is required');
    }

    $appliances = $data['appliances'];
    $location = $data['location'] ?? 'Kenya';
    
    // AI-powered appliance analysis (simulated for now)
    $analysis = analyzeAppliancesWithAI($appliances, $location);
    
    echo json_encode([
        'success' => true,
        'data' => $analysis
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();

/**
 * Analyze appliances and calculate energy requirements
 * This simulates AI analysis with conservative estimates
 */
function analyzeAppliancesWithAI($appliances, $location) {
    // Appliance power database (watts)
    $applianceDatabase = [
        'refrigerator' => ['watts' => 150, 'hours' => 24, 'type' => 'continuous'],
        'fridge' => ['watts' => 150, 'hours' => 24, 'type' => 'continuous'],
        'freezer' => ['watts' => 100, 'hours' => 24, 'type' => 'continuous'],
        'tv' => ['watts' => 100, 'hours' => 6, 'type' => 'intermittent'],
        'television' => ['watts' => 100, 'hours' => 6, 'type' => 'intermittent'],
        'led tv' => ['watts' => 60, 'hours' => 6, 'type' => 'intermittent'],
        'laptop' => ['watts' => 65, 'hours' => 8, 'type' => 'intermittent'],
        'computer' => ['watts' => 200, 'hours' => 8, 'type' => 'intermittent'],
        'desktop' => ['watts' => 200, 'hours' => 8, 'type' => 'intermittent'],
        'lights' => ['watts' => 10, 'hours' => 6, 'type' => 'intermittent'],
        'bulbs' => ['watts' => 10, 'hours' => 6, 'type' => 'intermittent'],
        'led lights' => ['watts' => 5, 'hours' => 6, 'type' => 'intermittent'],
        'microwave' => ['watts' => 1000, 'hours' => 0.5, 'type' => 'intermittent'],
        'electric kettle' => ['watts' => 1500, 'hours' => 0.25, 'type' => 'intermittent'],
        'kettle' => ['watts' => 1500, 'hours' => 0.25, 'type' => 'intermittent'],
        'washing machine' => ['watts' => 500, 'hours' => 1, 'type' => 'intermittent'],
        'iron' => ['watts' => 1000, 'hours' => 0.5, 'type' => 'intermittent'],
        'fan' => ['watts' => 75, 'hours' => 8, 'type' => 'intermittent'],
        'air conditioner' => ['watts' => 1500, 'hours' => 6, 'type' => 'intermittent'],
        'ac' => ['watts' => 1500, 'hours' => 6, 'type' => 'intermittent'],
        'water pump' => ['watts' => 750, 'hours' => 2, 'type' => 'intermittent'],
        'phone charger' => ['watts' => 5, 'hours' => 4, 'type' => 'intermittent'],
        'router' => ['watts' => 12, 'hours' => 24, 'type' => 'continuous'],
        'wifi router' => ['watts' => 12, 'hours' => 24, 'type' => 'continuous'],
        'decoder' => ['watts' => 15, 'hours' => 8, 'type' => 'intermittent'],
        'dstv' => ['watts' => 15, 'hours' => 8, 'type' => 'intermittent'],
        'radio' => ['watts' => 10, 'hours' => 4, 'type' => 'intermittent'],
        'blender' => ['watts' => 300, 'hours' => 0.25, 'type' => 'intermittent'],
        'toaster' => ['watts' => 800, 'hours' => 0.25, 'type' => 'intermittent'],
    ];

    $totalWatts = 0;
    $dailyKwh = 0;
    $analyzedAppliances = [];
    
    foreach ($appliances as $appliance) {
        $name = strtolower(trim($appliance['name'] ?? ''));
        $quantity = intval($appliance['quantity'] ?? 1);
        
        // Find matching appliance in database
        $matchedAppliance = null;
        foreach ($applianceDatabase as $key => $data) {
            if (strpos($name, $key) !== false) {
                $matchedAppliance = $data;
                break;
            }
        }
        
        // If no match found, use conservative defaults
        if (!$matchedAppliance) {
            $matchedAppliance = [
                'watts' => 50,
                'hours' => 4,
                'type' => 'intermittent'
            ];
        }
        
        $applianceWatts = $matchedAppliance['watts'] * $quantity;
        $applianceKwh = ($applianceWatts * $matchedAppliance['hours']) / 1000;
        
        $totalWatts += $applianceWatts;
        $dailyKwh += $applianceKwh;
        
        $analyzedAppliances[] = [
            'name' => ucfirst($name),
            'quantity' => $quantity,
            'watts' => $matchedAppliance['watts'],
            'total_watts' => $applianceWatts,
            'hours_per_day' => $matchedAppliance['hours'],
            'daily_kwh' => round($applianceKwh, 3),
            'type' => $matchedAppliance['type']
        ];
    }
    
    // Calculate system requirements with safety factors
    $peakLoad = $totalWatts * 1.25; // 25% safety factor
    $dailyEnergy = $dailyKwh * 1.3; // 30% safety factor for losses
    
    // Battery capacity calculation (2 days autonomy, 50% depth of discharge)
    $batteryCapacityKwh = $dailyEnergy * 2 / 0.5;
    $batteryCapacityAh = $batteryCapacityKwh * 1000 / 12; // Assuming 12V system
    
    // Solar panel calculation (5 peak sun hours for Kenya)
    $peakSunHours = getLocationPeakSunHours($location);
    $solarPanelWatts = ($dailyEnergy * 1000) / $peakSunHours;
    
    // Inverter sizing (3x peak load for surge capacity)
    $inverterWatts = $peakLoad * 3;
    
    return [
        'location' => $location,
        'peak_sun_hours' => $peakSunHours,
        'appliances' => $analyzedAppliances,
        'summary' => [
            'total_peak_load_watts' => round($totalWatts),
            'recommended_inverter_watts' => round($inverterWatts),
            'daily_energy_kwh' => round($dailyKwh, 2),
            'daily_energy_with_losses_kwh' => round($dailyEnergy, 2),
            'battery_capacity_kwh' => round($batteryCapacityKwh, 2),
            'battery_capacity_ah' => round($batteryCapacityAh),
            'solar_panel_watts' => round($solarPanelWatts)
        ],
        'recommendations' => generateRecommendations($totalWatts, $dailyKwh, $location)
    ];
}

function getLocationPeakSunHours($location) {
    $sunHours = [
        'kenya' => 5.0,
        'nairobi' => 5.2,
        'mombasa' => 4.8,
        'kisumu' => 5.1,
        'nakuru' => 5.3,
        'eldoret' => 5.4,
        'default' => 4.5
    ];
    
    $location = strtolower($location);
    return $sunHours[$location] ?? $sunHours['default'];
}

function generateRecommendations($totalWatts, $dailyKwh, $location) {
    $recommendations = [];
    
    if ($totalWatts < 500) {
        $recommendations[] = "Small system suitable for basic lighting and charging";
    } elseif ($totalWatts < 1500) {
        $recommendations[] = "Medium system suitable for typical household appliances";
    } else {
        $recommendations[] = "Large system suitable for full household with heavy appliances";
    }
    
    if ($dailyKwh < 5) {
        $recommendations[] = "Low energy consumption - efficient appliances recommended";
    } elseif ($dailyKwh < 15) {
        $recommendations[] = "Moderate energy consumption - consider energy-efficient alternatives";
    } else {
        $recommendations[] = "High energy consumption - professional energy audit recommended";
    }
    
    $recommendations[] = "System designed for " . ucfirst($location) . " climate conditions";
    $recommendations[] = "All calculations include 25-30% safety factors";
    $recommendations[] = "Final installation should be verified by certified solar technician";
    
    return $recommendations;
}
?>
