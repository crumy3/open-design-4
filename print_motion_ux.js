const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'temp-ui-ux-pro-max-skill', 'src', 'ui-ux-pro-max', 'data');

function readCSV(filename) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i+1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const ux = readCSV('ux-guidelines.csv');
const motion = readCSV('motion.csv');

console.log("=== MOTION GUIDELINES (First 5) ===");
motion.slice(0, 8).forEach(m => {
  console.log(`- Category: ${m['Category']} | Trigger: ${m['Trigger']}`);
  console.log(`  GSAP/Snippet: ${m['GSAP Snippet']}`);
  console.log(`  Do: ${m['Do']}`);
  console.log(`  Don't: ${m['Don\'t']}`);
});

console.log("\n=== UX GUIDELINES (First 8) ===");
ux.slice(0, 10).forEach(u => {
  console.log(`- Category: ${u['Category']} | Issue: ${u['Issue']}`);
  console.log(`  Description: ${u['Description']}`);
  console.log(`  Do: ${u['Do']}`);
  console.log(`  Don't: ${u['Don\'t']}`);
});
