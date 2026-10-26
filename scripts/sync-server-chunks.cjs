const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), '.next', 'server', 'chunks');
const dstDir = path.join(process.cwd(), '.next', 'server');

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      fs.copyFileSync(path.join(srcDir, file), path.join(dstDir, file));
    } catch {
      // ignore copy errors
    }
  }
}
