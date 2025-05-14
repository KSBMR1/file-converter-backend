const fs = require('fs').promises;
const path = require('path');

const cleanupFiles = async () => {
  const dirs = [path.join(__dirname, '../../uploads'), path.join(__dirname, '../../converted')];
  for (const dir of dirs) {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);
      if (Date.now() - stats.mtimeMs > 30 * 60 * 1000) {
        await fs.unlink(filePath);
      }
    }
  }
};

module.exports = { cleanupFiles };