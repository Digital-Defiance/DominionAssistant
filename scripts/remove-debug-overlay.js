// scripts/remove-debug-overlay.js
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process'; // Import execSync here

// Configuration
const capacitorWebDir = path.join(__dirname, '../dist/dominion-assistant'); // Use the correct Nx build output directory
const indexPath = path.join(capacitorWebDir, 'index.html');

console.log('Removing debug overlay from Capacitor app...');

if (fs.existsSync(indexPath)) {
  let indexHtml = fs.readFileSync(indexPath, 'utf8');

  // Remove the debug helper script
  const debugScriptRegex = /\s*<script>\s*\/\/ Debug helper[\s\S]*?logToScreen[\s\S]*?<\/script>/;
  indexHtml = indexHtml.replace(debugScriptRegex, '');

  // Save the modified file
  fs.writeFileSync(indexPath, indexHtml);
  console.log('Debug overlay removed from index.html');

  // Run capacitor sync
  try {
    console.log('Running Capacitor sync...');
    execSync('npx cap sync', { stdio: 'inherit' }); // Use imported execSync
    console.log('Capacitor sync completed');
  } catch (error) {
    console.error('Error during Capacitor sync:', error);
  }
} else {
  console.error('Could not find index.html in the Capacitor web directory');
}

console.log('Done! Rebuild and run your app to see the changes.');
