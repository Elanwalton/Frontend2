<?php
require_once __DIR__ . '/ApiHelper.php';
$conn = getDbConnection();

// Disable foreign key checks if any, though usually not needed for standalone table
mysqli_query($conn, "SET FOREIGN_KEY_CHECKS = 0");

// Truncate Products Table
echo "Truncating products table...\n";
if (!mysqli_query($conn, "TRUNCATE TABLE products")) {
    die("Error truncating table: " . mysqli_error($conn) . "\n");
}

$products = [
    [
        'name' => 'Solis 5.0kW Off-Grid Single Phase Inverter (Low Voltage)',
        'sku' => 'SOLIS-OG-5KW-LV',
        'price' => 40000,
        'category' => 'Inverters',
        'description' => 'Transform your home into an energy-independent powerhouse with the Solis 5.0kW off-grid single-phase inverter. Engineered specifically for residential solar systems in Kenya, this reliable inverter delivers consistent 5000W power output perfect for medium-sized homes.',
        'short_description' => 'Complete Solar Independence for Kenyan Homes. 5000W power output.',
        'features' => ['Pure sine wave output for sensitive electronics', 'Low-voltage battery compatibility (24V-48V systems)', 'Intelligent power conversion efficiency >95%', 'Built-in overload and short-circuit protection', 'LCD display for real-time monitoring'],
        'specifications' => ['Rated Power' => '5000W', 'Phase' => 'Single Phase', 'Input Voltage Range' => '120-430VDC', 'Output Voltage' => '220V/230V AC ±10%', 'Protection Rating' => 'IP65'],
        'keywords' => '5kw solar inverter Kenya, off-grid inverter Nairobi, Solis inverter price Kenya, residential solar inverter',
        'image' => 'solis-5kw.jpg'
    ],
    [
        'name' => 'Solis 6.0kW Hybrid Single Phase Inverter (Low Voltage)',
        'sku' => 'SOLIS-HY-6KW-LV',
        'price' => 135000,
        'category' => 'Inverters',
        'description' => 'Experience ultimate energy flexibility with the Solis 6.0kW hybrid inverter. This intelligent system automatically switches between solar, battery storage, and grid power, ensuring uninterrupted electricity supply while maximizing your solar investment.',
        'short_description' => 'Smart Energy Management for Modern Kenyan Homes. Tri-mode operation.',
        'features' => ['Tri-mode operation: Solar, Battery, Grid', 'Smart load prioritization technology', 'Real-time grid monitoring and switching', 'MPPT charge controller for maximum solar efficiency', 'Mobile app monitoring and control'],
        'specifications' => ['Rated Power' => '6000W continuous', 'Peak Power' => '9000W surge capacity', 'MPPT Efficiency' => '99.9%', 'Battery Voltage Range' => '40-60VDC', 'Warranty' => '5 years standard'],
        'keywords' => '6kw hybrid inverter Kenya, solar hybrid system Nairobi, grid-tie inverter Kenya, Solis 6kw price',
        'image' => 'solis-6kw-hybrid.jpg'
    ],
    [
        'name' => 'Solis 8.0kW Hybrid Single Phase Inverter (Low Voltage)',
        'sku' => 'SOLIS-HY-8KW-LV',
        'price' => 150000,
        'category' => 'Inverters',
        'description' => 'The Solis 8.0kW hybrid inverter represents the perfect balance of power, efficiency, and reliability for larger homes and light commercial installations across Kenya. Handle air conditioning, water pumps, and multiple appliances simultaneously without compromise.',
        'short_description' => 'High-Performance Power for Demanding Applications. 8000W power output.',
        'features' => ['8000W continuous power output', 'Advanced dual MPPT for multiple roof orientations', 'Zero-transfer-time UPS function', 'Generator compatibility for triple backup', 'Surge protection up to 12,000W'],
        'specifications' => ['Rated Power' => '8000W', 'Max Input Current' => '2×13A (dual MPPT)', 'Max PV Input' => '10,000W', 'Efficiency' => '97.6% peak', 'AC Output' => '230V, 50Hz'],
        'keywords' => '8kw solar inverter Kenya, high-power hybrid inverter, commercial solar inverter Nairobi',
        'image' => 'solis-8kw-hybrid.jpg'
    ],
    [
        'name' => 'Solis 10.0kW Hybrid Single Phase Inverter (Low Voltage)',
        'sku' => 'SOLIS-HY-10KW-LV',
        'price' => 180000,
        'category' => 'Inverters',
        'description' => 'Engineered for high-consumption applications, the Solis 10.0kW hybrid inverter delivers industrial reliability in a single-phase package. Perfect for large estates, commercial buildings, and energy-intensive operations requiring uncompromising power quality.',
        'short_description' => 'Commercial-Grade Power for Maximum Energy Demands. 10,000W continuous power.',
        'features' => ['Massive 10,000W continuous power capacity', 'Triple power source management (Solar/Battery/Grid)', 'Advanced load shedding protection', 'Parallel operation capable (up to 6 units)', 'Industrial-grade components'],
        'specifications' => ['Rated Output' => '10,000W continuous', 'Peak Surge' => '15,000W (30 seconds)', 'Max Solar Input' => '13,000W', 'Conversion Efficiency' => '97.8%', 'Battery Voltage' => '48V DC nominal'],
        'keywords' => '10kw solar inverter Kenya, commercial hybrid inverter, industrial solar inverter',
        'image' => 'solis-10kw-hybrid.jpg'
    ],
    [
        'name' => 'Solis 12.0kW Hybrid Single Phase Inverter (Low Voltage)',
        'sku' => 'SOLIS-HY-12KW-LV',
        'price' => 230000,
        'category' => 'Inverters',
        'description' => 'The flagship Solis 12.0kW hybrid inverter represents the pinnacle of single-phase solar technology. Designed for discerning customers who demand absolute reliability, scalability, and cutting-edge energy management for their properties.',
        'short_description' => 'Premium Power Solution for Elite Installations. 12,000W power output.',
        'features' => ['Market-leading 12,000W power output', 'Intelligent energy optimization algorithms', 'Battery life extension technology', 'Advanced grid support functions', 'Emergency power reserve function'],
        'specifications' => ['Continuous Power' => '12,000W', 'Surge Capacity' => '18,000W', 'Max PV Array' => '15,600W', 'Efficiency Rating' => '98.1% peak', 'MPPT Trackers' => '2 independent'],
        'keywords' => '12kw hybrid inverter Kenya, premium solar inverter, luxury home solar system',
        'image' => 'solis-12kw-hybrid.jpg'
    ],
    [
        'name' => 'Solis 30kW High Voltage Inverter',
        'sku' => 'SOLIS-HV-30KW',
        'price' => 450000,
        'category' => 'Inverters',
        'description' => 'Step into commercial-scale solar with the Solis 30kW high-voltage inverter. Engineered for businesses, institutions, and industrial facilities requiring serious power generation capacity with maximum efficiency and reliability.',
        'short_description' => 'Industrial Power for Commercial Solar Installations. Three-phase 30kW output.',
        'features' => ['Three-phase 30,000W output', 'High-voltage DC input (up to 1000V)', 'Multi-MPPT design for complex roof layouts', 'Advanced grid synchronization', 'Commercial-grade cooling system'],
        'specifications' => ['Rated Power' => '30,000W (30kW)', 'Max Input Voltage' => '1000VDC', 'Output' => 'Three-phase 400VAC', 'Efficiency' => '98.5%', 'MPPT Trackers' => '3-4 independent'],
        'keywords' => '30kw solar inverter Kenya, commercial solar system, three-phase inverter Nairobi',
        'image' => 'solis-30kw-hv.jpg'
    ],
    [
        'name' => 'Solis 50kW High Voltage Inverter',
        'sku' => 'SOLIS-HV-50KW',
        'price' => 650000,
        'category' => 'Inverters',
        'description' => 'The Solis 50kW represents the ultimate in commercial solar technology for Kenya\'s largest energy consumers. Built for continuous operation under demanding conditions, this inverter powers entire facilities with clean, reliable solar energy.',
        'short_description' => 'Heavy-Duty Industrial Solar Power System. Massive 50kW output.',
        'features' => ['Massive 50,000W three-phase output', 'Industrial-grade construction and components', 'Active cooling with intelligent fan control', 'Advanced fault detection and protection', '99.9% uptime reliability'],
        'specifications' => ['Rated Output' => '50,000W (50kW)', 'Max DC Voltage' => '1100VDC', 'Peak Efficiency' => '98.7%', 'AC Output' => '400VAC three-phase', 'MPPT Channels' => '4-6 independent'],
        'keywords' => '50kw solar inverter Kenya, large-scale solar system, industrial solar installation',
        'image' => 'solis-50kw-hv.jpg'
    ],
    [
        'name' => 'Dyness 5.0kWh Lithium Battery (Low Voltage)',
        'sku' => 'DYNESS-LV-5KWH',
        'price' => 111000,
        'category' => 'Batteries',
        'description' => 'Store your solar energy efficiently with the Dyness 5.0kWh lithium battery. This compact powerhouse provides essential backup power while maximizing your solar investment through intelligent energy storage and management.',
        'short_description' => 'Reliable Solar Energy Storage for Kenyan Homes. 5.12kWh capacity.',
        'features' => ['5120Wh usable energy capacity', 'LiFePO4 chemistry for safety and longevity', '6000+ charge cycle lifespan (10+ years)', 'Built-in Battery Management System (BMS)', 'Modular and expandable design'],
        'specifications' => ['Nominal Voltage' => '51.2V', 'Usable Capacity' => '5.0kWh (100Ah)', 'Depth of Discharge' => '95% (DOD)', 'Round-trip Efficiency' => '96%', 'Cycle Life' => '6000+ cycles'],
        'keywords' => '5kwh lithium battery Kenya, solar battery Nairobi, Dyness battery price',
        'image' => 'dyness-5kwh.jpg'
    ],
    [
        'name' => 'Dyness 14.0kWh Lithium Battery (Low Voltage)',
        'sku' => 'DYNESS-LV-14KWH',
        'price' => 250000,
        'category' => 'Batteries',
        'description' => 'Triple your energy storage capacity with the Dyness 14.0kWh lithium battery system. Designed for homes and businesses requiring extended backup times and comprehensive solar energy utilization.',
        'short_description' => 'Extended Energy Independence for Larger Homes. 14.34kWh massive storage.',
        'features' => ['Massive 14.34kWh energy storage', 'Stackable modular design', 'Smart BMS with mobile monitoring', 'Ultra-long 8000+ cycle life', 'Seamless inverter integration'],
        'specifications' => ['Nominal Voltage' => '51.2V', 'Capacity' => '14.34kWh (280Ah)', 'Efficiency' => '97%', 'Max Continuous Current' => '100A', 'Warranty' => '10 years'],
        'keywords' => '14kwh battery Kenya, large solar battery, Dyness 14kwh price Nairobi',
        'image' => 'dyness-14kwh.jpg'
    ],
    [
        'name' => 'Dyness Power Brick 14.0kWh Lithium Battery',
        'sku' => 'DYNESS-PB-14KWH',
        'price' => 250000,
        'category' => 'Batteries',
        'description' => 'The Dyness Power Brick revolutionizes energy storage with its ultra-compact design and high energy density. Perfect for installations where space is premium but power requirements are substantial.',
        'short_description' => 'Compact High-Density Energy Storage. 14.0kWh in minimal footprint.',
        'features' => ['Compact power-brick architecture', '14.0kWh in minimal footprint', 'Advanced thermal management', 'Plug-and-play installation', 'Intelligent cell balancing'],
        'specifications' => ['Energy Capacity' => '14.0kWh', 'Voltage' => '51.2V nominal', 'Cycle Life' => '6000+ cycles at 90% DOD', 'Efficiency' => '96.5%', 'Max Discharge' => '140A continuous'],
        'keywords' => 'compact solar battery Kenya, power brick battery, space-saving energy storage',
        'image' => 'dyness-power-brick.jpg'
    ],
    [
        'name' => 'Dyness Stoic 100 – 5.0kWh Lithium Battery (High Voltage, 51.2V)',
        'sku' => 'DYNESS-HV-STOIC100',
        'price' => 105000,
        'category' => 'Batteries',
        'description' => 'Experience the next generation of battery technology with the Dyness Stoic 100. Engineered for high-voltage hybrid systems, this battery delivers superior performance, safety, and value for modern solar installations.',
        'short_description' => 'Premium High-Voltage Energy Storage. 5.12kWh capacity.',
        'features' => ['High-voltage 51.2V architecture', 'Enhanced safety design', 'Rapid charge/discharge capability', 'Intelligent thermal regulation', 'Premium automotive-grade cells'],
        'specifications' => ['Capacity' => '5.12kWh (100Ah)', 'Voltage' => '51.2V (high voltage)', 'Round-trip Efficiency' => '97%', 'Max Discharge Current' => '100A', 'Warranty' => '10-year performance'],
        'keywords' => 'high-voltage battery Kenya, Dyness Stoic price, 51.2V lithium battery',
        'image' => 'dyness-stoic-100.jpg'
    ],
    [
        'name' => 'Dyness Stoic 280 – 14.0kWh Lithium Battery (High Voltage, 51.2V)',
        'sku' => 'DYNESS-HV-STOIC280',
        'price' => 250000,
        'category' => 'Batteries',
        'description' => 'The Dyness Stoic 280 represents the pinnacle of residential and commercial energy storage. With 14.0kWh capacity and high-voltage architecture, it\'s engineered for demanding applications requiring maximum performance and reliability.',
        'short_description' => 'Maximum Capacity High-Voltage Storage. 14.34kWh capacity.',
        'features' => ['Substantial 14.34kWh capacity', 'High-voltage 51.2V system', 'Industrial-grade construction', 'Advanced cooling system', 'Scalable to 240kWh+'],
        'specifications' => ['Energy' => '14.34kWh (280Ah)', 'Voltage' => '51.2V nominal', 'Efficiency' => '97.5%', 'Cycle Life' => '8000+ cycles', 'Temperature Range' => '-20°C to 55°C'],
        'keywords' => '14kwh high-voltage battery Kenya, Dyness Stoic 280 price, large-scale energy storage',
        'image' => 'dyness-stoic-280.jpg'
    ],
    [
        'name' => 'X-Batt 5.0kWh Lithium Battery (Low Voltage)',
        'sku' => 'XBATT-LV-5KWH',
        'price' => 100000,
        'category' => 'Batteries',
        'description' => 'The X-Batt 5.0kWh offers exceptional value without compromising quality. Perfect for budget-conscious homeowners and small businesses seeking reliable solar energy storage at an accessible price point.',
        'short_description' => 'Affordable Reliability for Solar Storage. 5.0kWh capacity.',
        'features' => ['Cost-effective energy storage', 'Proven LiFePO4 technology', '5000+ cycle warranty', 'Plug-and-play simplicity', 'Reliable performance'],
        'specifications' => ['Capacity' => '5.0kWh (100Ah)', 'Voltage' => '48V/51.2V compatible', 'Efficiency' => '95%', 'Cycle Life' => '5000+ cycles', 'Warranty' => '5 years'],
        'keywords' => 'affordable solar battery Kenya, X-Batt price Nairobi, budget lithium battery',
        'image' => 'xbatt-5kwh.jpg'
    ],
    [
        'name' => 'X-Batt 10.0kWh Lithium Battery (Low Voltage)',
        'sku' => 'XBATT-LV-10KWH',
        'price' => 180000,
        'category' => 'Batteries',
        'description' => 'Double your storage capacity with the X-Batt 10.0kWh battery system. Ideal for medium-sized homes and small businesses requiring extended backup power and enhanced solar energy utilization.',
        'short_description' => 'Mid-Range Power for Growing Energy Needs. 10.24kWh total capacity.',
        'features' => ['10.24kWh total capacity', 'Expandable modular design', 'Reliable performance', 'Simple installation', 'Excellent value for money'],
        'specifications' => ['Energy' => '10.24kWh (200Ah)', 'Voltage' => '51.2V', 'Efficiency' => '95%', 'Max Current' => '100A continuous', 'Cycle Life' => '5000+ cycles'],
        'keywords' => '10kwh battery Kenya, mid-range solar storage, X-Batt 10kwh price',
        'image' => 'xbatt-10kwh.jpg'
    ],
    [
        'name' => 'X-Batt 16.0kWh Lithium Battery (Low Voltage)',
        'sku' => 'XBATT-LV-16KWH',
        'price' => 250000,
        'category' => 'Batteries',
        'description' => 'The X-Batt 16.0kWh delivers maximum storage capacity for heavy energy users. Designed for large homes and commercial applications requiring extensive backup power and complete energy independence.',
        'short_description' => 'High-Capacity Storage for Demanding Applications. 16.38kWh massive capacity.',
        'features' => ['Massive 16.38kWh capacity', 'Heavy-duty construction', 'Extended cycle life', 'Multiple protection layers', 'Scalable architecture'],
        'specifications' => ['Total Energy' => '16.38kWh (320Ah)', 'Nominal Voltage' => '51.2V', 'Round-trip Efficiency' => '95.5%', 'Cycle Life' => '5500+ cycles', 'Continuous Discharge' => '160A'],
        'keywords' => '16kwh battery Kenya, large-capacity storage, X-Batt 16kwh price Nairobi',
        'image' => 'xbatt-16kwh.jpg'
    ],
    [
        'name' => 'Solar Pro 580W Solar Panel',
        'sku' => 'SOLARPRO-580W',
        'price' => 11600,
        'category' => 'Solar Panels',
        'description' => 'Harness maximum solar energy with Solar Pro 580W panels. Engineered for Kenya\'s tropical climate, these high-efficiency panels deliver consistent power generation for residential and commercial installations.',
        'short_description' => 'Reliable High-Output Solar Panels for Kenya. 580W max output.',
        'features' => ['580W maximum power output', 'Monocrystalline PERC technology', 'High efficiency rating (21%+)', 'Excellent low-light performance', '25-year power output warranty'],
        'specifications' => ['Rated Power' => '580W (±3%)', 'Cell Type' => 'Monocrystalline PERC', 'Efficiency' => '21.2%', 'Output Warranty' => '25-year linear', 'Voltage (Vmp)' => '41.8V'],
        'keywords' => '580W solar panel Kenya, Solar Pro panels Nairobi, monocrystalline solar panel',
        'image' => 'solarpro-580w.jpg'
    ],
    [
        'name' => 'Solar Pro 620W Solar Panel',
        'sku' => 'SOLARPRO-620W',
        'price' => 12400,
        'category' => 'Solar Panels',
        'description' => 'Step up to 620W of clean solar energy with Solar Pro\'s advanced panel technology. Designed for maximum power generation in minimum roof space, perfect for space-constrained installations.',
        'short_description' => 'Advanced High-Power Solar Technology. 620W enhanced output.',
        'features' => ['Enhanced 620W power output', 'Latest generation monocrystalline cells', 'Superior efficiency (21.5%+)', 'Advanced half-cut cell technology', 'Optimized temperature coefficient'],
        'specifications' => ['Rated Power' => '620W (±3%)', 'Module Efficiency' => '21.6%', 'Voc' => '52.8V', 'Isc' => '14.88A', 'Temperature Coefficient' => '-0.34%/°C'],
        'keywords' => '620W solar panel Kenya, high-power solar panels, efficient solar panels Kenya',
        'image' => 'solarpro-620w.jpg'
    ],
    [
        'name' => 'Longi 620W Solar Panel',
        'sku' => 'LONGI-620W',
        'price' => 13640,
        'category' => 'Solar Panels',
        'description' => 'Experience world-class solar performance with Longi 620W panels. As the world\'s largest solar manufacturer, Longi delivers unmatched quality, efficiency, and reliability for the most demanding installations.',
        'short_description' => 'Premium Solar Panels from Global Leader. Hi-MO 5 technology.',
        'features' => ['Premium 620W output', 'Industry-leading efficiency (22%+)', 'Hi-MO 5 technology platform', 'Exceptional build quality', '30-year performance warranty'],
        'specifications' => ['Rated Power' => '620W (±3%)', 'Module Efficiency' => '22.1%', 'Cell Type' => 'Monocrystalline N-type', 'Degradation' => '0.4% annually', 'Warranty' => '30-year performance'],
        'keywords' => 'Longi solar panels Kenya, premium 620W panels, Tier 1 solar panels',
        'image' => 'longi-620w.jpg'
    ],
    [
        'name' => 'Longi 670W Solar Panel',
        'sku' => 'LONGI-670W',
        'price' => 14740,
        'category' => 'Solar Panels',
        'description' => 'Maximize your solar investment with Longi\'s flagship 670W panel. This ultra-high-power module represents the cutting edge of solar technology, delivering unmatched performance for large-scale residential and commercial projects.',
        'short_description' => 'Ultra-High-Power Solar Panel Technology. 670W flagship output.',
        'features' => ['Exceptional 670W power output', 'Industry-leading 22.5% efficiency', 'Hi-MO 6 Explorer series', 'Largest mainstream panel', 'Premium N-type technology'],
        'specifications' => ['Rated Power' => '670W (±3%)', 'Module Efficiency' => '22.5%', 'Cell Technology' => 'N-type TOPCon', 'Vmp' => '45.8V', 'Warranty' => '30-year linear'],
        'keywords' => 'Longi 670W Kenya, ultra-high-power solar panel, 670W panel price Kenya',
        'image' => 'longi-670w.jpg'
    ],
    [
        'name' => '4.0mm² DC Solar Cable (Per Meter)',
        'sku' => 'CABLE-DC-4MM',
        'price' => 130,
        'category' => 'Accessories',
        'description' => 'Professional-grade 4.0mm² DC solar cable designed specifically for photovoltaic installations. TUV-certified and UV-resistant for long-lasting performance in Kenya\'s tropical climate.',
        'short_description' => 'Standard Solar Cable for Residential Systems. TUV-certified.',
        'features' => ['4.0mm² copper conductor', 'Double insulation (PV1-F rated)', 'UV and ozone resistant', 'Temperature range: -40°C to +90°C', '25-year outdoor lifespan'],
        'specifications' => ['Conductor Size' => '4.0mm²', 'Voltage Rating' => '1.8kV DC', 'Current Capacity' => '32A', 'Overall Diameter' => '6.0mm', 'Certification' => 'TUV 2PfG 1169'],
        'keywords' => '4mm solar cable Kenya, DC cable price Nairobi, PV cable Kenya',
        'image' => 'cable-4mm.jpg'
    ],
    [
        'name' => '6.0mm² DC Solar Cable (Per Meter)',
        'sku' => 'CABLE-DC-6MM',
        'price' => 150,
        'category' => 'Accessories',
        'description' => 'Robust 6.0mm² solar cable engineered for medium to large solar installations. Handles higher currents with minimal voltage drop, ensuring maximum system efficiency.',
        'short_description' => 'Heavy-Duty Cable for Higher Current Systems. 50A capacity.',
        'features' => ['6.0mm² tinned copper conductor', 'Enhanced current capacity (50A)', 'Superior voltage drop performance', 'Double-insulated construction', 'Extreme weather resistance'],
        'specifications' => ['Max Current' => '50A continuous', 'Voltage Rating' => '1.8kV rated', 'Operating Temp' => '-40°C to 120°C', 'Overall Diameter' => '7.2mm', 'Lifespan' => '25+ years'],
        'keywords' => '6mm solar cable Kenya, heavy-duty DC cable, 6mm² solar wire Kenya',
        'image' => 'cable-6mm.jpg'
    ],
    [
        'name' => '10.0mm² DC Solar Cable (Per Meter)',
        'sku' => 'CABLE-DC-10MM',
        'price' => 200,
        'category' => 'Accessories',
        'description' => 'Premium 10.0mm² solar cable designed for large-scale commercial and industrial installations. Maximum current capacity with minimal voltage drop for optimal system performance.',
        'short_description' => 'Industrial-Grade Cable for Large Solar Systems. 80A capacity.',
        'features' => ['Extra-thick 10.0mm² conductor', 'Ultra-low resistance', '80A continuous current capacity', 'Industrial-grade insulation', 'Maximum durability'],
        'specifications' => ['Current Capacity' => '80A', 'Voltage Rating' => '1.8kV DC', 'Conductor Size' => '10.0mm²', 'Resistance' => '<1.95O/km at 20°C', 'Overall Diameter' => '9.5mm'],
        'keywords' => '10mm solar cable Kenya, industrial DC cable, 10mm² DC wire Kenya',
        'image' => 'cable-10mm.jpg'
    ],
    [
        'name' => 'Suntree DC Breaker 32A',
        'sku' => 'SUNTREE-DCB-32A',
        'price' => 1500,
        'category' => 'Accessories',
        'description' => 'Professional-grade 32A DC circuit breaker designed specifically for photovoltaic applications. Protects your solar investment from overcurrent, short circuits, and electrical faults.',
        'short_description' => 'Essential Circuit Protection for Solar Systems. 32A capacity.',
        'features' => ['32A rated current capacity', '1000V DC voltage rating', 'Dual-pole breaking', 'Arc suppression technology', 'DIN rail mountable'],
        'specifications' => ['Rated Current' => '32A', 'Voltage' => '1000V DC', 'Breaking Capacity' => '6kA', 'Poles' => '2-pole', 'Operating Temp' => '-25°C to +70°C'],
        'keywords' => 'DC breaker Kenya, 32A solar breaker, PV breaker price',
        'image' => 'breaker-32a.jpg'
    ],
    [
        'name' => 'Suntree DC Breaker 62A',
        'sku' => 'SUNTREE-DCB-62A',
        'price' => 2000,
        'category' => 'Accessories',
        'description' => 'Heavy-duty 62A DC circuit breaker engineered for commercial and high-power residential solar installations. Provides reliable protection for larger current demands.',
        'short_description' => 'High-Capacity Protection for Larger Systems. 62A capacity.',
        'features' => ['62A continuous current rating', '1000V DC rated voltage', 'Enhanced arc quenching', 'Thermal-magnetic operation', 'Long mechanical life (20,000+ operations)'],
        'specifications' => ['Rated Current' => '62A', 'Voltage' => '1000V max', 'Breaking Capacity' => '10kA', 'Endurance' => '20,000 mechanical ops', 'Tripping' => 'C-curve'],
        'keywords' => '62A DC breaker Kenya, high-capacity solar breaker, Suntree 62A price Kenya',
        'image' => 'breaker-62a.jpg'
    ],
    [
        'name' => 'Suntree DC Surge Protection Device (SPD)',
        'sku' => 'SUNTREE-SPD-DC',
        'price' => 2000,
        'category' => 'Accessories',
        'description' => 'Advanced surge protection device designed to safeguard your solar investment from lightning strikes, voltage surges, and electrical transients. Essential for system longevity and safety.',
        'short_description' => 'Lightning and Surge Protection for Solar Systems. Type 2 SPD.',
        'features' => ['Type 2 surge protection', '1000V DC rated', '40kA surge current capacity (8/20µs)', 'Visual status indicator', 'Replaceable protection modules'],
        'specifications' => ['Max Continuous Voltage' => '1000V DC', 'Surge Current (Imax)' => '40kA', 'Response Time' => '<25ns', 'Protection level' => '<4kV', 'Standard' => 'IEC 61643-31'],
        'keywords' => 'DC surge protector Kenya, lightning protection solar, SPD device Nairobi',
        'image' => 'spd-dc.jpg'
    ],
    [
        'name' => 'Suntree DC Fuse',
        'sku' => 'SUNTREE-FUSE-DC',
        'price' => 1500,
        'category' => 'Accessories',
        'description' => 'Professional DC-rated fuse designed for photovoltaic string protection. Fast-acting protection against overcurrent conditions and short circuits in solar installations.',
        'short_description' => 'Overcurrent Protection Fuse for Solar Systems. Fast-acting gPV.',
        'features' => ['PV-specific DC fuse', '1000V/1500V DC rated', 'Fast-acting (gPV rated)', 'Ceramic body construction', 'Easy replacement design'],
        'specifications' => ['Voltage Rating' => '1000V/1500V DC', 'Breaking Capacity' => '20kA', 'Size' => '10×38mm', 'Fuse Type' => 'gPV', 'Standard' => 'IEC 60269-6'],
        'keywords' => 'DC fuse Kenya, solar fuse protection, string protection fuse Kenya',
        'image' => 'fuse-dc.jpg'
    ],
    [
        'name' => 'Suntree 4-Way Combiner Box',
        'sku' => 'SUNTREE-CB-4W',
        'price' => 800,
        'category' => 'Accessories',
        'description' => 'Professional 4-string combiner box for organizing and protecting small to medium solar installations. Essential for safe, efficient string combining and circuit protection.',
        'short_description' => 'Compact String Combiner for Small Solar Systems. 4-way organization.',
        'features' => ['4 input strings', '1 combined output', 'IP65 weatherproof rating', 'Built-in fuse holders', 'Polycarbonate enclosure'],
        'specifications' => ['Strings' => '4 Channels', 'Rated Voltage' => '1000V DC', 'Output Current' => '60A combined', 'Protection' => 'IP65', 'Material' => 'Polycarbonate'],
        'keywords' => '4-way combiner box Kenya, string combiner Nairobi, solar junction box',
        'image' => 'combiner-4way.jpg'
    ],
    [
        'name' => 'Suntree 8-Way Combiner Box',
        'sku' => 'SUNTREE-CB-8W',
        'price' => 1400,
        'category' => 'Accessories',
        'description' => 'Versatile 8-string combiner box designed for medium-sized residential and commercial solar installations. Provides organized string management with comprehensive protection.',
        'short_description' => 'Medium-Capacity String Combiner. 8-string management.',
        'features' => ['8 independent string inputs', 'Single combined DC output', 'Integrated fuse protection', 'Surge protection ready', 'Weatherproof IP65 design'],
        'specifications' => ['Input Channels' => '8 strings', 'Combined Output' => '120A', 'Protection Class' => 'IP65', 'Voltage Rating' => '1000V DC', 'Enclosure Material' => 'UV-stabilized'],
        'keywords' => '8-way combiner box Kenya, medium combiner Nairobi, 8-string junction box',
        'image' => 'combiner-8way.jpg'
    ],
    [
        'name' => 'Suntree 12-Way Combiner Box',
        'sku' => 'SUNTREE-CB-12W',
        'price' => 1800,
        'category' => 'Accessories',
        'description' => 'Professional 12-string combiner box engineered for large residential and commercial solar installations. Comprehensive protection and organization for complex solar arrays.',
        'short_description' => 'Large-Capacity String Management System. 12-string capacity.',
        'features' => ['12 string input capacity', 'Heavy-duty construction', 'Integrated monitoring points', 'Surge and fuse protection', 'Robust IP65 enclosure'],
        'specifications' => ['String Inputs' => '12 channels', 'Total Output' => '180A capability', 'DC Voltage' => '1000V rated', 'Protection' => 'IP65', 'Design Life' => '20+ years'],
        'keywords' => '12-way combiner box Kenya, large string combiner, 12-string junction',
        'image' => 'combiner-12way.jpg'
    ],
    [
        'name' => 'Suntree 14-Way Combiner Box',
        'sku' => 'SUNTREE-CB-14W',
        'price' => 2200,
        'category' => 'Accessories',
        'description' => 'Premium 14-string combiner box designed for the largest residential and commercial solar installations. Ultimate organization, protection, and monitoring capabilities.',
        'short_description' => 'Maximum Capacity String Combiner. 14-way organization.',
        'features' => ['14 independent string inputs', 'Advanced protection integration', 'Professional-grade construction', 'Monitoring system ready', 'Maximum IP65 protection'],
        'specifications' => ['Input Capacity' => '14 strings', 'Combined Output' => '210A', 'Enclosure Size' => '500×400×200mm', 'Weight' => '5.5kg', 'Standard' => 'IEC 61439 compliant'],
        'keywords' => '14-way combiner box Kenya, maximum capacity combiner, 14-string junction box',
        'image' => 'combiner-14way.jpg'
    ],
    [
        'name' => 'Earth Rod (Grounding Rod)',
        'sku' => 'EARTH-ROD-STD',
        'price' => 700,
        'category' => 'Accessories',
        'description' => 'Professional copper-bonded steel earth rod designed for reliable electrical grounding in solar installations. Critical safety component for lightning protection and fault current dissipation.',
        'short_description' => 'Essential Grounding Component for System Safety. 1.5m length.',
        'features' => ['Copper-bonded steel construction', '1.5m standard length', '16mm diameter', 'High conductivity', 'Corrosion resistant'],
        'specifications' => ['Length' => '1.5 meters', 'Diameter' => '16mm', 'Material' => 'Copper-bonded steel', 'Resistance' => '<10O (typical)', 'Lifespan' => '25+ years'],
        'keywords' => 'earth rod Kenya, grounding rod Nairobi, solar grounding',
        'image' => 'earth-rod.jpg'
    ],
    [
        'name' => '2×4 Trunking (Cable Management)',
        'sku' => 'TRUNKING-2X4',
        'price' => 700,
        'category' => 'Accessories',
        'description' => 'High-quality PVC trunking for neat, safe, and professional cable routing in solar installations. Essential for organized, code-compliant wiring systems.',
        'short_description' => 'Professional Cable Management Solution. 50x100mm profile.',
        'features' => ['2×4 inch (50×100mm) profile', '2-meter standard lengths', 'PVC construction', 'Self-extinguishing material', 'Snap-on cover design'],
        'specifications' => ['Size' => '2×4 inches', 'Length' => '2 meters', 'Material' => 'Rigid PVC', 'Fire Rating' => 'Self-extinguishing', 'Capacity' => 'Up to 12× 6mm² cables'],
        'keywords' => 'cable trunking Kenya, 2×4 trunking Nairobi, wire organizer Kenya',
        'image' => 'trunking-2x4.jpg'
    ],
    [
        'name' => 'Powder-Coated 16-Way Combiner Box',
        'sku' => 'PC-CB-16W',
        'price' => 18000,
        'category' => 'Accessories',
        'description' => 'Professional powder-coated steel combiner box designed for demanding commercial and industrial solar installations. Maximum durability, protection, and professional appearance.',
        'short_description' => 'Industrial-Grade Metal Combiner Box. 16-string capacity.',
        'features' => ['Heavy-duty steel construction', 'Premium powder-coat finish', '16 string capacity', 'IP65 weatherproof rating', 'Lockable security door'],
        'specifications' => ['Spring Inputs' => '16 channels', 'Voltage Rating' => '1500V DC', 'Combined Output' => '320A capability', 'Enclosure' => '2mm galvanized steel', 'Weight' => '18kg'],
        'keywords' => '16-way metal combiner Kenya, industrial combiner box Nairobi, powder-coated combiner',
        'image' => 'metal-combiner-16way.jpg'
    ],
    [
        'name' => 'Powder-Coated 32-Way Combiner Box',
        'sku' => 'PC-CB-32W',
        'price' => 27000,
        'category' => 'Accessories',
        'description' => 'The ultimate in solar string management: a robust 32-string powder-coated steel combiner box for large-scale commercial, industrial, and utility solar installations.',
        'short_description' => 'Maximum Capacity Industrial Combiner System. 32-string management.',
        'features' => ['Massive 32 string capacity', 'Industrial steel construction', 'Premium finish and durability', 'Complete monitoring integration', 'Maximum security features'],
        'specifications' => ['Input Channels' => '32 strings', 'Total Output' => '640A capacity', 'Voltage Rating' => '1500V DC', 'Weight' => '35kg', 'Protection' => 'IP65'],
        'keywords' => '32-way combiner box Kenya, industrial solar combiner Nairobi, large-scale combiner',
        'image' => 'metal-combiner-32way.jpg'
    ]
];

function createSlug($string) {
    $string = strtolower($string);
    $string = preg_replace('/[^a-z0-9\-]/', '-', $string);
    $string = preg_replace('/-+/', '-', $string);
    return trim($string, '-');
}

$stmt = mysqli_prepare($conn, "INSERT INTO products (
    name, slug, sku, price, category, description, short_description, 
    features, specifications, focus_keyword, meta_title, meta_description, 
    main_image_url, stock_quantity, status, created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())");

$count = 0;
foreach ($products as $p) {
    $slug = createSlug($p['name']);
    $featuresJson = json_encode($p['features']);
    $specsJson = json_encode($p['specifications']);
    $metaTitle = $p['name'] . " - Sunleaf Tech Kenya";
    $metaDesc = substr(strip_tags($p['description']), 0, 155);
    $stock = 100; // Default stock
    
    // Fallback image path if needed (usually buildMediaUrl handles icons if img missing)
    $imgUrl = $p['image'];

    mysqli_stmt_bind_param($stmt, "sssdsssssssssi", 
        $p['name'], 
        $slug, 
        $p['sku'], 
        $p['price'], 
        $p['category'], 
        $p['description'], 
        $p['short_description'],
        $featuresJson,
        $specsJson,
        $p['keywords'],
        $metaTitle,
        $metaDesc,
        $imgUrl,
        $stock
    );
    
    if (mysqli_stmt_execute($stmt)) {
        $count++;
        echo "Inserted: {$p['name']}\n";
    } else {
        echo "Error inserting {$p['name']}: " . mysqli_error($conn) . "\n";
    }
}

mysqli_query($conn, "SET FOREIGN_KEY_CHECKS = 1");
echo "\nCatalog rebuild complete. Total products inserted: $count\n";
?>
