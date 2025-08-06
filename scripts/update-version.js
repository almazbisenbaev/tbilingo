#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Update version in manifest.json
function updateManifestVersion() {
  const manifestPath = path.join(__dirname, '../public/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Increment version
  const versionParts = manifest.version.split('.');
  versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
  manifest.version = versionParts.join('.');
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Updated manifest version to ${manifest.version}`);
}

// Update version in pwa-utils.ts
function updatePWAUtilsVersion() {
  const utilsPath = path.join(__dirname, '../src/utils/pwa-utils.ts');
  let content = fs.readFileSync(utilsPath, 'utf8');
  
  // Update PWA_VERSION
  const versionMatch = content.match(/export const PWA_VERSION = '([^']+)'/);
  if (versionMatch) {
    const currentVersion = versionMatch[1];
    const versionParts = currentVersion.split('.');
    versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
    const newVersion = versionParts.join('.');
    
    content = content.replace(
      /export const PWA_VERSION = '[^']+'/,
      `export const PWA_VERSION = '${newVersion}'`
    );
    
    fs.writeFileSync(utilsPath, content);
    console.log(`Updated PWA_VERSION to ${newVersion}`);
  }
}

// Main function
function main() {
  try {
    updateManifestVersion();
    updatePWAUtilsVersion();
    console.log('Version update completed successfully!');
  } catch (error) {
    console.error('Error updating version:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 