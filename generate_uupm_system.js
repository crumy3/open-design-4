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

const products = readCSV('products.csv');
const styles = readCSV('styles.csv');
const colors = readCSV('colors.csv');
const typography = readCSV('typography.csv');
const ux = readCSV('ux-guidelines.csv');
const uiReasoning = readCSV('ui-reasoning.csv');
const landing = readCSV('landing.csv');

// Print Marketing Agency details (No 69) and B2B Service (No 5)
const marketing = products.find(p => p['No'] === '69');

console.log("=========================================");
console.log(`PRODUCT TYPE: ${marketing['Product Type']}`);
console.log(`Primary Style: ${marketing['Primary Style Recommendation']}`);
console.log(`Secondary Styles: ${marketing['Secondary Styles']}`);
console.log(`Landing Page Pattern: ${marketing['Landing Page Pattern']}`);
console.log(`Color Palette Focus: ${marketing['Color Palette Focus']}`);
console.log(`Key Considerations: ${marketing['Key Considerations']}`);
console.log("=========================================");

// Style details
console.log("\n=== RECOMMENDED STYLES ===");
styles.forEach(s => {
  const styleName = s['Style Category'] || s['Type'];
  if (styleName.toLowerCase().includes('brutalism') || styleName.toLowerCase().includes('motion-driven') || styleName.toLowerCase().includes('minimalism') || styleName.toLowerCase().includes('trust')) {
    console.log(`\n--- Style: ${styleName} ---`);
    console.log(`Keywords: ${s['Keywords']}`);
    console.log(`Effects: ${s['Effects & Animation']}`);
    console.log(`Best For: ${s['Best For']}`);
    console.log(`Light Mode: ${s['Light Mode ✓']} | Dark Mode: ${s['Dark Mode ✓']}`);
    console.log(`Checklist: ${s['Implementation Checklist']}`);
    console.log(`Technical Keywords: ${s['CSS/Technical Keywords']}`);
  }
});

// Typography details
console.log("\n=== RECOMMENDED TYPOGRAPHY ===");
typography.forEach(t => {
  const name = t['Font Pairing Name'];
  const mood = t['Mood/Style Keywords'] || '';
  const bestFor = t['Best For'] || '';
  if (bestFor.toLowerCase().includes('agency') || bestFor.toLowerCase().includes('marketing') || bestFor.toLowerCase().includes('portfolio') || mood.toLowerCase().includes('brutalist') || mood.toLowerCase().includes('bold')) {
    console.log(`\n- Pairing: ${name}`);
    console.log(`  Heading: ${t['Heading Font']} | Body: ${t['Body Font']}`);
    console.log(`  Mood: ${mood}`);
    console.log(`  CSS Import: ${t['CSS Import']}`);
  }
});

// Landing page details
console.log("\n=== LANDING PAGE PATTERNS ===");
landing.forEach(l => {
  const name = l['Pattern Name'];
  if (name.toLowerCase().includes('storytelling') || name.toLowerCase().includes('feature-rich') || name.toLowerCase().includes('showcase')) {
    console.log(`\n- Pattern: ${name}`);
    console.log(`  Sections: ${l['Section Order']}`);
    console.log(`  CTA Placement: ${l['Primary CTA Placement']}`);
    console.log(`  Color Strategy: ${l['Color Strategy']}`);
    console.log(`  Recommended Effects: ${l['Recommended Effects']}`);
    console.log(`  Conversion: ${l['Conversion Optimization']}`);
  }
});
