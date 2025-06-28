const fs = require('fs');
const path = require('path');

function patchNativeJs(dir) {
  const rollupNative = path.join(dir, 'rollup', 'dist', 'native.js');
  if (fs.existsSync(rollupNative)) {
    let content = fs.readFileSync(rollupNative, 'utf8');
    if (!content.includes('// PATCHED BY patch-rollup-native.cjs')) {
      content = content.replace(/throw new Error\(([^)]*)\);/g, match => {
        return `// PATCHED BY patch-rollup-native.cjs: ${match}`;
      });
      fs.writeFileSync(rollupNative, content, 'utf8');
      console.log('Patched:', rollupNative);
    } else {
      console.log('Already patched:', rollupNative);
    }
  }
}

// Recursively patch all node_modules (including nested)
function walkNodeModules(dir) {
  if (!fs.existsSync(dir)) return;
  patchNativeJs(dir);
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) return;
      walkNodeModules(path.join(dir, entry.name, 'node_modules'));
    }
  });
}

walkNodeModules(path.join(__dirname, 'node_modules')); 