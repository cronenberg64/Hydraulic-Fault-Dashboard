const fs = require('fs');
const path = require('path');

const nativeJsPath = path.join(__dirname, 'node_modules', 'rollup', 'dist', 'native.js');

if (fs.existsSync(nativeJsPath)) {
  let content = fs.readFileSync(nativeJsPath, 'utf8');
  // Only patch if not already patched
  if (!content.includes('// PATCHED BY patch-rollup-native.js')) {
    content = content.replace(/throw new Error\(([^)]*)\);/g, match => {
      return `// PATCHED BY patch-rollup-native.js: ${match}`;
    });
    fs.writeFileSync(nativeJsPath, content, 'utf8');
    console.log('Patched rollup native.js to skip native module error.');
  } else {
    console.log('Rollup native.js already patched.');
  }
} else {
  console.log('rollup/dist/native.js not found, skipping patch.');
} 