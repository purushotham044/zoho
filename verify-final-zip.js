/**
 * Verify artifact-final.zip structure
 */

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const zipPath = path.join(__dirname, '..', 'artifact-final.zip');

if (!fs.existsSync(zipPath)) {
  console.error('❌ artifact-final.zip not found!');
  process.exit(1);
}

console.log('🔍 Verifying artifact-final.zip structure...\n');

const zip = new AdmZip(zipPath);
const entries = zip.getEntries();

console.log('📋 ZIP Contents:\n');

const requiredFiles = [
  'catalyst-config.json',
  'index.js',
  'package.json',
  'package-lock.json',
  'catalyst/scheduler.json'
];

const foundFiles = [];
const foundDirs = new Set();

entries.forEach(entry => {
  const name = entry.entryName;
  if (entry.isDirectory) {
    foundDirs.add(name);
  } else {
    foundFiles.push(name);
    console.log(`  ✅ ${name}`);
  }
});

console.log('\n📁 Directories:');
foundDirs.forEach(dir => {
  console.log(`  📂 ${dir}`);
});

console.log('\n✅ Verification Summary:');
let allGood = true;

requiredFiles.forEach(file => {
  if (foundFiles.includes(file)) {
    console.log(`  ✅ ${file} - Found`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allGood = false;
  }
});

// Check for node_modules (should NOT be present)
const hasNodeModules = foundFiles.some(f => f.includes('node_modules')) || 
                       Array.from(foundDirs).some(d => d.includes('node_modules'));

if (hasNodeModules) {
  console.log('\n  ⚠️  WARNING: node_modules found in ZIP (should be excluded)');
  allGood = false;
} else {
  console.log('\n  ✅ No node_modules found (correct)');
}

// Check catalyst-config.json content
const configEntry = zip.getEntry('catalyst-config.json');
if (configEntry) {
  const configContent = configEntry.getData().toString('utf8');
  const config = JSON.parse(configContent);
  
  console.log('\n📄 catalyst-config.json content:');
  console.log(JSON.stringify(config, null, 2));
  
  if (config.execution && config.execution.type === 'advancedio') {
    console.log('\n  ✅ Execution key present with correct type');
  } else {
    console.log('\n  ❌ Execution key missing or incorrect');
    allGood = false;
  }
}

console.log(`\n📦 Total files: ${foundFiles.length}`);
console.log(`📁 Total directories: ${foundDirs.size}`);
console.log(`💾 ZIP size: ${(fs.statSync(zipPath).size / 1024).toFixed(2)} KB`);

if (allGood) {
  console.log('\n✅ ZIP structure is CORRECT and ready for deployment!');
} else {
  console.log('\n❌ ZIP structure has issues!');
  process.exit(1);
}

