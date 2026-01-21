const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_SVG = path.join(__dirname, '../public/images/remove background.svg');
const OUTPUT_DIR = path.join(__dirname, '../public');

// Favicon sizes to generate
const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateFavicons() {
  console.log('🎨 Generating favicons from SVG...\n');

  // Check if input SVG exists
  if (!fs.existsSync(INPUT_SVG)) {
    console.error('❌ Error: SVG file not found at:', INPUT_SVG);
    process.exit(1);
  }

  try {
    // Generate each size
    for (const { name, size } of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, name);
      
      await sharp(INPUT_SVG)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: ${name} (${size}×${size})`);
    }

    // Generate favicon.ico (multi-resolution)
    console.log('\n🔧 Generating favicon.ico...');
    const icoPath = path.join(OUTPUT_DIR, 'favicon.ico');
    
    // For ICO, we'll create a 32x32 version (most common)
    await sharp(INPUT_SVG)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(icoPath.replace('.ico', '-temp.png'));
    
    // Rename to .ico (browsers will accept PNG format with .ico extension)
    fs.renameSync(icoPath.replace('.ico', '-temp.png'), icoPath);
    console.log('✅ Generated: favicon.ico (32×32)');

    console.log('\n🎉 All favicons generated successfully!');
    console.log('\n📁 Files created in /public:');
    console.log('   - favicon.ico');
    SIZES.forEach(({ name }) => console.log(`   - ${name}`));
    
    console.log('\n💡 Next step: Update your layout.tsx with the new favicon links!');
    
  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

// Run the script
generateFavicons();
