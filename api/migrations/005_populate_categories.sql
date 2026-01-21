-- =====================================================
-- POPULATE CATEGORIES WITH SEO DATA
-- =====================================================

INSERT INTO categories (
  id, 
  parent_id, 
  name, 
  slug, 
  description,
  meta_title,
  meta_description,
  keywords,
  icon,
  display_order,
  created_at
) VALUES
(1, NULL, 'Batteries', 'lithium-batteries-kenya', 
 'High-quality lithium iron phosphate (LiFePO4) batteries for solar energy storage. 6000+ cycle life, 10-year warranty.',
 'Lithium Batteries Kenya | Solar Energy Storage - Best Prices Nairobi',
 'Premium lithium batteries in Kenya. Dyness & X-Batt 5-16kWh LiFePO4 batteries. 10-year warranty. Free delivery Nairobi. Shop solar storage now!',
 'lithium batteries Kenya, solar batteries Nairobi, LiFePO4 batteries, Dyness battery price, energy storage Kenya',
 '/icons/battery.svg',
 2,
 NOW()),

(2, NULL, 'Inverters', 'solar-inverters-kenya', 
 'Complete range of solar inverters for residential, commercial and industrial applications in Kenya',
 'Solar Inverters Kenya | Off-Grid & Hybrid Inverters - Best Prices',
 'Premium solar inverters in Kenya. Solis 5kW-50kW off-grid & hybrid inverters. Free installation. Warranty included. Shop now in Nairobi!',
 'solar inverters Kenya, hybrid inverters Nairobi, off-grid inverters, Solis inverters price Kenya, grid-tie inverters',
 '/icons/inverter.svg',
 1,
 NOW()),

(3, NULL, 'Mounting Accessories', 'solar-accessories-kenya', 
 'Professional solar system accessories including circuit protection, surge devices, combiner boxes, and grounding equipment.',
 'Solar Accessories Kenya | Breakers, SPD, Combiner Boxes - Best Prices',
 'Complete solar accessories in Kenya. DC breakers, surge protection, combiner boxes, grounding equipment. Professional grade. Shop Nairobi!',
 'solar accessories Kenya, DC breakers, surge protection, combiner boxes, solar equipment Nairobi',
 '/icons/accessories.svg',
 5,
 NOW()),

(4, NULL, 'Solar Outdoor Lights', 'solar-outdoor-lights-kenya', 
 'High-quality solar outdoor lighting solutions for gardens, streets, and security applications.',
 'Solar Outdoor Lights Kenya | Garden & Security Lights - Best Prices',
 'Premium solar outdoor lights in Kenya. Garden lights, flood lights, street lights. Energy-efficient, durable. Shop Nairobi!',
 'solar outdoor lights Kenya, solar garden lights, solar flood lights Nairobi, solar security lights',
 '/icons/light.svg',
 4,
 NOW()),

(5, NULL, 'Solar Panels', 'solar-panels-kenya', 
 'High-efficiency monocrystalline solar panels from Tier 1 manufacturers. 21-22.5% efficiency, 25-year warranty.',
 'Solar Panels Kenya | 580W-670W High-Efficiency Panels - Best Prices',
 'Premium solar panels in Kenya. Solar Pro & Longi 580-670W monocrystalline panels. 25-year warranty. Tier 1 manufacturers. Shop Nairobi!',
 'solar panels Kenya, Longi panels Nairobi, Solar Pro panels, monocrystalline panels, solar panel price Kenya',
 '/icons/solar-panel.svg',
 3,
 NOW()),

(6, NULL, 'DC Solar Cables', 'dc-solar-cables-kenya', 
 'Professional-grade DC solar cables for photovoltaic installations. TUV-certified, UV-resistant, 25-year outdoor lifespan.',
 'DC Solar Cables Kenya | 4mm-10mm PV Cables - TUV Certified',
 'Professional DC solar cables in Kenya. 4mm, 6mm, 10mm² TUV-certified PV cables. UV-resistant, 25-year lifespan. Best prices Nairobi!',
 'DC solar cables Kenya, PV cables Nairobi, solar wiring, photovoltaic cables, TUV solar cables',
 '/icons/cable.svg',
 6,
 NOW());

-- Show success
SELECT 'Categories populated with SEO data!' as Status;
SELECT * FROM categories ORDER BY display_order;
