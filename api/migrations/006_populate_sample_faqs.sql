-- =====================================================
-- POPULATE SAMPLE FAQs
-- =====================================================

INSERT INTO faqs (question, answer, category, display_order, status) VALUES
('How much does a complete solar system cost in Kenya?', 
 'Complete residential solar systems in Kenya range from <strong>KES 400,000</strong> (3kW system) to <strong>KES 2,000,000+</strong> (15kW+ system), depending on size, components, and battery storage requirements. The price includes solar panels, inverter, batteries, installation, and commissioning. Contact us for a free customized quote based on your specific energy needs.',
 'Pricing & Costs',
 1,
 'active'),

('What size solar system do I need for my home in Kenya?',
 'A typical <strong>3-4 bedroom home</strong> in Kenya requires a <strong>5-8kW solar system</strong> with <strong>10-15kWh battery storage</strong>. However, the exact size depends on your:<br>
 • Number and type of appliances<br>
 • Daily energy consumption (kWh)<br>
 • Backup power requirements<br>
 • Air conditioning usage<br><br>
 We provide <strong>free load assessments</strong> to determine your exact requirements. Our experts will analyze your electricity bills and appliance usage to design the perfect system for your needs.',
 'System Sizing',
 1,
 'active'),

('How long do solar panels last in Kenya?',
 'Quality solar panels like <strong>Longi and Solar Pro last 25-30 years</strong> in Kenya with minimal degradation (less than 20% over 25 years). They come with:<br>
 • <strong>25-year linear power warranty</strong> (guaranteed 80%+ output after 25 years)<br>
 • <strong>12-year product warranty</strong> (manufacturing defects)<br>
 • Expected lifespan of 30-35 years<br><br>
 Kenya\'s tropical climate is actually ideal for solar panels, with high sun exposure year-round. Regular cleaning (2-3 times per year) ensures optimal performance.',
 'Product Lifespan',
 1,
 'active'),

('Can I run air conditioning on solar power?',
 'Yes! Properly sized systems (<strong>8kW+</strong>) can run multiple air conditioners. Here\'s what you need:<br><br>
 <strong>For 1 AC unit (1.5 HP):</strong><br>
 • Minimum 5kW solar system<br>
 • 10kWh battery storage<br><br>
 <strong>For 2-3 AC units:</strong><br>
 • 8-12kW solar system<br>
 • 15-20kWh battery storage<br><br>
 We design systems based on your specific appliance needs, including air conditioning, water heaters, and other high-power devices.',
 'System Capabilities',
 2,
 'active'),

('What happens during power outages with a solar system?',
 '<strong>Hybrid and off-grid systems</strong> with batteries automatically switch to battery power during outages, providing <strong>seamless backup</strong> in less than 10 milliseconds (you won\'t even notice!).<br><br>
 <strong>Grid-tie systems without batteries</strong> will shut down during outages for safety reasons (anti-islanding protection).<br><br>
 With a properly sized battery system, you can have:<br>
 • <strong>8-12 hours</strong> backup for entire home<br>
 • <strong>24+ hours</strong> backup for essential loads only<br>
 • <strong>Unlimited backup</strong> with solar charging during the day',
 'Power Backup',
 1,
 'active'),

('Do solar systems work during the rainy season in Kenya?',
 'Yes! While generation is reduced on cloudy days, modern panels still produce <strong>20-30% of rated capacity</strong>. Here\'s what to expect:<br><br>
 <strong>Sunny days:</strong> 100% production<br>
 <strong>Partly cloudy:</strong> 50-70% production<br>
 <strong>Overcast/rainy:</strong> 20-30% production<br><br>
 Battery storage ensures continuous power even during extended cloudy periods. Most systems in Kenya generate excess power during sunny months, which compensates for rainy season reduction.',
 'Weather & Performance',
 2,
 'active'),

('What maintenance is required for solar systems?',
 'Solar systems require <strong>minimal maintenance</strong>:<br><br>
 <strong>Annual tasks:</strong><br>
 • Clean panels (remove dust, leaves, bird droppings)<br>
 • Visual inspection of wiring and connections<br>
 • Check inverter display for errors<br>
 • Verify battery performance<br><br>
 <strong>Professional maintenance (recommended annually):</strong><br>
 • Comprehensive system check<br>
 • Electrical testing<br>
 • Performance optimization<br>
 • Firmware updates<br><br>
 Our maintenance packages start from <strong>KES 15,000/year</strong> and include all professional servicing.',
 'Maintenance',
 1,
 'active'),

('Are there government incentives for solar in Kenya?',
 'Yes! Kenya offers several incentives:<br><br>
 <strong>VAT Exemption:</strong><br>
 • 0% VAT on solar equipment (normally 16%)<br>
 • Significant savings on total system cost<br><br>
 <strong>Duty Exemptions:</strong><br>
 • Reduced import duties on solar components<br><br>
 <strong>Net Metering (Grid-tie):</strong><br>
 • Sell excess power back to Kenya Power<br>
 • Credit on your electricity bill<br><br>
 We assist with all documentation and applications for these incentives.',
 'Incentives & Financing',
 1,
 'active'),

('How long is the payback period for solar in Kenya?',
 'Typical payback period is <strong>3-5 years</strong>, depending on:<br>
 • System size and cost<br>
 • Your current electricity consumption<br>
 • Electricity tariff rates<br>
 • Solar system efficiency<br><br>
 <strong>Example calculation:</strong><br>
 • System cost: KES 800,000 (8kW with batteries)<br>
 • Monthly savings: KES 15,000 (eliminating KES 18,000 bill)<br>
 • Annual savings: KES 180,000<br>
 • Payback period: 4.4 years<br><br>
 After payback, you enjoy <strong>20+ years of free electricity</strong>!',
 'ROI & Savings',
 1,
 'active'),

('Can I expand my solar system later?',
 'Yes! Our systems are designed for <strong>easy expansion</strong>:<br><br>
 <strong>Battery expansion:</strong><br>
 • Add more battery modules (up to 8 units in parallel)<br>
 • Increase backup capacity as needed<br><br>
 <strong>Solar panel expansion:</strong><br>
 • Add more panels (if inverter capacity allows)<br>
 • Increase daily energy generation<br><br>
 <strong>Inverter upgrade:</strong><br>
 • Replace with higher capacity inverter<br>
 • Support more appliances<br><br>
 We recommend starting with a system that meets 80% of your needs, then expanding as budget allows.',
 'System Expansion',
 2,
 'active');

-- Show success
SELECT 'Sample FAQs populated!' as Status;
SELECT COUNT(*) as 'Total FAQs' FROM faqs;
