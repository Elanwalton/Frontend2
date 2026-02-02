const fs = require('fs');
const path = require('path');

const projectDir = process.cwd();
const componentsDir = path.join(projectDir, 'components');
const stylesDir = path.join(projectDir, 'styles');
const appDir = path.join(projectDir, 'app');

// Helper to recursively get files
function getFiles(dir, exts, excludes = []) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      // Check excludes
      if (excludes.some(ex => filePath.includes(ex))) return;

      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(filePath, exts, excludes));
      } else {
        if (exts.includes(path.extname(file))) {
          results.push(filePath);
        }
      }
    });
  } catch (e) {
    // console.error(`Error reading ${dir}: ${e.message}`);
  }
  return results;
}

// Get all source files to search IN (where imports would be)
const sourceFiles = getFiles(projectDir, ['.tsx', '.ts', '.jsx', '.js'], ['node_modules', '.next', 'find-unused.js']);

// Get all component files to check usage OF
const componentFiles = getFiles(componentsDir, ['.tsx', '.jsx'], []);

console.log('--- ANALYSIS STARTED ---');
console.log(`Scanning ${sourceFiles.length} source files for references...`);
console.log(`Checking ${componentFiles.length} components...`);

const unusedComponents = [];

componentFiles.forEach(compPath => {
  const compName = path.basename(compPath, path.extname(compPath));
  
  // Skip obvious test/dev files from being reported if they are just labeled as such
  if (compName.toLowerCase().includes('test')) {
      unusedComponents.push({ name: compName, path: compPath, reason: 'Test File' });
      return;
  }

  // Construct import patterns
  // 1. import ... from '@/components/Name'
  // 2. import ... from '../components/Name'
  // 3. import ... from './Name' (if in components dir)
  
  let isUsed = false;
  
  for (const srcFile of sourceFiles) {
    if (srcFile === compPath) continue; // Don't check self-reference

    const content = fs.readFileSync(srcFile, 'utf8');
    
    // Naive but effective check for the component name being imported or used as a tag
    // We check for the name in a way that suggests it's being imported or used in JSX
    if (content.includes(compName)) {
      isUsed = true;
      break;
    }
  }

  if (!isUsed) {
    unusedComponents.push({ name: compName, path: compPath, reason: 'No references found' });
  }
});

console.log('\n--- UNUSED COMPONENTS ---');
unusedComponents.forEach(c => {
  console.log(`[${c.reason}] ${c.name} (${c.path.replace(projectDir, '')})`);
});

// Check CSS/SCSS
const cssFiles = [
    ...getFiles(stylesDir, ['.css', '.module.css']),
    ...getFiles(appDir, ['.css', '.module.css'])
].filter(f => !f.includes('globals.css')); // Exclude globals

console.log(`\nChecking ${cssFiles.length} CSS files...`);
const unusedCSS = [];

cssFiles.forEach(cssPath => {
    const cssName = path.basename(cssPath);
    let isUsed = false;

    // For module.css, we look for the import
    // import styles from '.../Name.module.css'
    
    for (const srcFile of sourceFiles) {
        const content = fs.readFileSync(srcFile, 'utf8');
        if (content.includes(cssName) || content.includes(cssName.replace('.css', ''))) {
            isUsed = true;
            break;
        }
    }

    if (!isUsed) {
        unusedCSS.push(path.relative(projectDir, cssPath));
    }
});

console.log('\n--- UNUSED CSS FILES ---');
unusedCSS.forEach(c => console.log(c));

console.log('\n--- ANALYSIS COMPLETE ---');
