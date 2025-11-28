/**
 * Create artifact-production.zip with exact structure for Catalyst deployment
 * Root level files: catalyst-config.json, index.js, package.json, package-lock.json
 * catalyst/ folder with functions, lib, scheduler.json, README.md
 * NO node_modules included
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('📦 Creating artifact-production.zip with exact structure...\n');

// Output zip path
const outputZip = path.join(__dirname, '..', 'artifact-production.zip');

// Remove old zip if exists
if (fs.existsSync(outputZip)) {
  fs.unlinkSync(outputZip);
  console.log('🗑️  Removed existing artifact-production.zip\n');
}

// Create zip archive
const output = fs.createWriteStream(outputZip);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ Package created: ${outputZip}`);
  console.log(`   Size: ${(archive.pointer() / 1024).toFixed(2)} KB\n`);
  console.log('📋 Structure:');
  console.log('   ROOT/');
  console.log('     catalyst-config.json');
  console.log('     index.js');
  console.log('     package.json');
  console.log('     package-lock.json');
  console.log('     catalyst/');
  console.log('       functions/');
  console.log('       lib/');
  console.log('       scheduler.json');
  console.log('       README.md\n');
  console.log('📤 Ready to upload to Catalyst Production!\n');
});

archive.on('error', (err) => {
  console.error('❌ Error creating package:', err);
  process.exit(1);
});

archive.pipe(output);

const rootDir = path.join(__dirname, '..');

// 1. Add catalyst-config.json at root
const catalystConfigPath = path.join(rootDir, 'catalyst-config.json');
if (fs.existsSync(catalystConfigPath)) {
  archive.file(catalystConfigPath, { name: 'catalyst-config.json' });
  console.log('✅ Added catalyst-config.json');
} else {
  console.error('❌ catalyst-config.json not found!');
  process.exit(1);
}

// 2. Add index.js at root (from catalyst/index.js)
const indexPath = path.join(rootDir, 'catalyst', 'index.js');
if (fs.existsSync(indexPath)) {
  archive.file(indexPath, { name: 'index.js' });
  console.log('✅ Added index.js');
} else {
  console.error('❌ catalyst/index.js not found!');
  process.exit(1);
}

// 3. Add package.json at root
const packageJsonPath = path.join(rootDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  archive.file(packageJsonPath, { name: 'package.json' });
  console.log('✅ Added package.json');
} else {
  console.error('❌ package.json not found!');
  process.exit(1);
}

// 4. Add package-lock.json at root
const packageLockPath = path.join(rootDir, 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
  archive.file(packageLockPath, { name: 'package-lock.json' });
  console.log('✅ Added package-lock.json');
} else {
  console.error('❌ package-lock.json not found!');
  process.exit(1);
}

// 5. Add catalyst/functions directory (excluding node_modules)
const functionsDir = path.join(rootDir, 'catalyst', 'functions');
if (fs.existsSync(functionsDir)) {
  archive.glob('**/*', {
    cwd: functionsDir,
    ignore: ['**/node_modules/**', '**/.git/**', 'node_modules/**']
  }, { prefix: 'catalyst/functions' });
  console.log('✅ Added catalyst/functions/');
} else {
  console.error('❌ catalyst/functions/ not found!');
  process.exit(1);
}

// 6. Add catalyst/lib directory (excluding node_modules)
const libDir = path.join(rootDir, 'catalyst', 'lib');
if (fs.existsSync(libDir)) {
  archive.glob('**/*', {
    cwd: libDir,
    ignore: ['**/node_modules/**', '**/.git/**', 'node_modules/**']
  }, { prefix: 'catalyst/lib' });
  console.log('✅ Added catalyst/lib/');
} else {
  console.error('❌ catalyst/lib/ not found!');
  process.exit(1);
}

// 7. Add scheduler.json
const schedulerPath = path.join(rootDir, 'catalyst', 'scheduler.json');
if (fs.existsSync(schedulerPath)) {
  archive.file(schedulerPath, { name: 'catalyst/scheduler.json' });
  console.log('✅ Added catalyst/scheduler.json');
} else {
  console.warn('⚠️  catalyst/scheduler.json not found (optional)');
}

// 8. Add README.md if it exists
const readmePath = path.join(rootDir, 'catalyst', 'README.md');
if (fs.existsSync(readmePath)) {
  archive.file(readmePath, { name: 'catalyst/README.md' });
  console.log('✅ Added catalyst/README.md');
} else {
  console.warn('⚠️  catalyst/README.md not found (optional)');
}

console.log('\n📦 Finalizing ZIP...\n');
archive.finalize();

