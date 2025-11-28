/**
 * Verify artifact-fixed.zip structure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const zipPath = path.join(__dirname, '..', 'artifact-fixed.zip');

if (!fs.existsSync(zipPath)) {
  console.error('❌ artifact-fixed.zip not found!');
  process.exit(1);
}

const stats = fs.statSync(zipPath);
console.log('📦 artifact-fixed.zip');
console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
console.log(`   Location: ${zipPath}`);
console.log('');

// Use PowerShell to list ZIP contents
try {
  const output = execSync(
    `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('${zipPath}').Entries | Select-Object -ExpandProperty FullName"`,
    { encoding: 'utf8', cwd: path.join(__dirname, '..') }
  );
  
  const files = output.trim().split('\n').filter(f => f.trim());
  console.log(`✅ Total files: ${files.length}`);
  console.log('');
  console.log('📋 Root level files:');
  const rootFiles = files.filter(f => !f.includes('/'));
  rootFiles.forEach(f => console.log(`   ✓ ${f}`));
  
  console.log('');
  console.log('📁 catalyst/ structure:');
  const catalystFiles = files.filter(f => f.startsWith('catalyst/'));
  const uniqueDirs = new Set();
  catalystFiles.forEach(f => {
    const parts = f.split('/');
    if (parts.length > 1) {
      uniqueDirs.add(parts[0] + '/' + parts[1]);
    }
  });
  Array.from(uniqueDirs).sort().forEach(d => console.log(`   ✓ ${d}/`));
  
  // Verify required files
  console.log('');
  console.log('🔍 Verification:');
  const required = [
    'catalyst-config.json',
    'index.js',
    'package.json',
    'package-lock.json'
  ];
  
  const filesTrimmed = files.map(f => f.trim());
  let allGood = true;
  required.forEach(file => {
    if (filesTrimmed.includes(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} - MISSING!`);
      allGood = false;
    }
  });
  
  if (allGood) {
    console.log('');
    console.log('✅ All required files present!');
    console.log('📤 Ready for Catalyst Production deployment!');
  }
} catch (error) {
  console.error('Error reading ZIP:', error.message);
}

