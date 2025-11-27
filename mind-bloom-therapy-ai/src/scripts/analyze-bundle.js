
/**
 * Bundle Analyzer Script
 * 
 * This script runs a bundle analysis build and opens the bundle visualizer.
 * Run with: node src/scripts/analyze-bundle.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure the stats directory exists
const statsDir = path.resolve(__dirname, '../../stats');
if (!fs.existsSync(statsDir)) {
  fs.mkdirSync(statsDir, { recursive: true });
}

console.log('🔍 Running bundle analysis build...');

try {
  // Run the build with analyze mode
  execSync('vite build --mode analyze', { stdio: 'inherit' });
  console.log('✅ Bundle analysis complete! Visualizer should open automatically.');
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
}
