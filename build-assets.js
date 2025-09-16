#!/usr/bin/env node

/**
 * Asset Versioning Script for James & Oliver's Wedding Site
 * Generates content-hashed filenames and updates HTML references
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const ASSETS_DIR = './assets';
const PAGES_DIR = './pages';
const BUILD_DIR = './dist';
const VERSION_FILE = './version.json';

// File types to hash
const HASHABLE_EXTENSIONS = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.woff', '.woff2'];

// Generate content hash for a file
function generateHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
}

// Copy file with hash in filename
function copyWithHash(srcPath, destDir) {
  const ext = path.extname(srcPath);
  const basename = path.basename(srcPath, ext);
  const hash = generateHash(srcPath);
  const hashedFilename = `${basename}.${hash}${ext}`;
  const destPath = path.join(destDir, hashedFilename);
  
  fs.copyFileSync(srcPath, destPath);
  return hashedFilename;
}

// Update HTML file to reference hashed assets
function updateHtmlReferences(htmlPath, assetMap) {
  let content = fs.readFileSync(htmlPath, 'utf8');
  
  // Replace asset references with hashed versions
  Object.entries(assetMap).forEach(([original, hashed]) => {
    const regex = new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(regex, hashed);
  });
  
  fs.writeFileSync(htmlPath, content);
}

// Main build function
function buildAssets() {
  console.log('🔨 Building assets with content hashing...');
  
  // Create build directory
  if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }
  
  // Create assets directory in build
  const buildAssetsDir = path.join(BUILD_DIR, 'assets');
  if (!fs.existsSync(buildAssetsDir)) {
    fs.mkdirSync(buildAssetsDir, { recursive: true });
  }
  
  const assetMap = {};
  
  // Process all files in assets directory
  function processDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const relativeItemPath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Create subdirectory in build
        const buildSubDir = path.join(buildAssetsDir, relativeItemPath);
        if (!fs.existsSync(buildSubDir)) {
          fs.mkdirSync(buildSubDir, { recursive: true });
        }
        processDirectory(fullPath, relativeItemPath);
      } else {
        const ext = path.extname(item);
        const originalPath = `assets/${relativeItemPath}`;
        
        if (HASHABLE_EXTENSIONS.includes(ext)) {
          // Hash the file
          const hashedFilename = copyWithHash(fullPath, path.join(buildAssetsDir, relativePath));
          const hashedPath = `assets/${path.join(relativePath, hashedFilename)}`;
          assetMap[originalPath] = hashedPath;
          console.log(`✅ ${originalPath} → ${hashedPath}`);
        } else {
          // Copy without hashing
          const destPath = path.join(buildAssetsDir, relativeItemPath);
          fs.copyFileSync(fullPath, destPath);
          console.log(`📋 ${originalPath} (copied)`);
        }
      }
    });
  }
  
  // Process assets directory
  processDirectory(ASSETS_DIR);
  
  // Copy and update HTML files
  const pages = fs.readdirSync(PAGES_DIR).filter(file => file.endsWith('.html'));
  pages.forEach(page => {
    const srcPath = path.join(PAGES_DIR, page);
    const destPath = path.join(BUILD_DIR, page);
    fs.copyFileSync(srcPath, destPath);
    updateHtmlReferences(destPath, assetMap);
    console.log(`📄 Updated ${page} with hashed asset references`);
  });
  
  // Copy other files
  const otherFiles = ['index.html', 'manifest.json', 'sw.js', 'robots.txt', 'CNAME'];
  otherFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const destPath = path.join(BUILD_DIR, file);
      fs.copyFileSync(file, destPath);
      if (file === 'index.html') {
        updateHtmlReferences(destPath, assetMap);
      }
      console.log(`📋 Copied ${file}`);
    }
  });
  
  // Generate version file
  const version = {
    version: Date.now().toString(),
    buildTime: new Date().toISOString(),
    assets: assetMap
  };
  
  fs.writeFileSync(path.join(BUILD_DIR, VERSION_FILE), JSON.stringify(version, null, 2));
  fs.writeFileSync(VERSION_FILE, JSON.stringify(version, null, 2));
  
  console.log('🎉 Build complete!');
  console.log(`📊 Processed ${Object.keys(assetMap).length} hashed assets`);
  console.log(`📁 Build output: ${BUILD_DIR}`);
}

// Run if called directly
if (require.main === module) {
  buildAssets();
}

module.exports = { buildAssets, generateHash };
