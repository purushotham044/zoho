/**
 * Verify artifact-production.zip structure
 */
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const zipPath = path.join(__dirname, '..', 'artifact-production.zip');

if (!fs.existsSync(zipPath)) {
  console.error('❌ artifact-production.zip not found!');
  process.exit(1);
}

const AdmZip = require('adm-zip');
const zip = new AdmZip(zipPath);
const entries = zip.getEntries();

console.log('📋 ZIP Contents:\n');
console.log('Root level files:');
const rootFiles = entries.filter(e => !e.entryName.includes('/') || e.entryName.split('/').length === 1);
rootFiles.forEach(e => {
  console.log(`  ✅ ${e.entryName}`);
});

console.log('\nCatalyst folder structure:');
const catalystFiles = entries.filter(e => e.entryName.startsWith('catalyst/'));
const seen = new Set();
catalystFiles.forEach(e => {
  const parts = e.entryName.split('/');
  if (parts.length >= 2) {
    const folder = parts[0] + '/' + parts[1];
    if (!seen.has(folder)) {
      seen.add(folder);
      console.log(`  📁 ${folder}/`);
    }
  }
  if (parts.length === 2 && !e.isDirectory) {
    console.log(`    ✅ ${parts[1]}`);
  }
});

console.log(`\n✅ Total entries: ${entries.length}`);
console.log(`✅ ZIP size: ${(fs.statSync(zipPath).size / 1024).toFixed(2)} KB`);

// Check for node_modules
const hasNodeModules = entries.some(e => e.entryName.includes('node_modules'));
if (hasNodeModules) {
  console.log('\n⚠️  WARNING: node_modules found in ZIP!');
} else {
  console.log('\n✅ No node_modules in ZIP (correct)');
}

// Check required files
const required = [
  'catalyst-config.json',
  'index.js',
  'package.json',
  'package-lock.json',
  'catalyst/scheduler.json'
];

console.log('\n📋 Required files check:');
required.forEach(file => {
  const found = entries.some(e => e.entryName === file);
  if (found) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING!`);
  }
});

