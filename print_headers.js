const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'temp-ui-ux-pro-max-skill', 'src', 'ui-ux-pro-max', 'data');

fs.readdirSync(dataDir).forEach(file => {
  if (file.endsWith('.csv')) {
    const filePath = path.join(dataDir, file);
    const firstLine = fs.readFileSync(filePath, 'utf8').split('\n')[0];
    console.log(`${file}: ${firstLine.trim()}`);
  }
});
