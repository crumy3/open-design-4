const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'temp-ui-ux-pro-max-skill', 'src', 'ui-ux-pro-max', 'data', 'products.csv');
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split('\n');

console.log("Lines containing 'Agency':");
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('agency')) {
    console.log(`${index + 1}: ${line}`);
  }
});
