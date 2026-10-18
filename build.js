const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- Starting TrustShield AI Frontend Build for Vercel ---');
const frontendDir = fs.existsSync('trustshield-ai/frontend') ? 'trustshield-ai/frontend' : (fs.existsSync('frontend') ? 'frontend' : '.');
console.log(`[*] Located frontend directory at: ${frontendDir}`);

// Run npm install and build inside frontend directory
execSync('npm install && npm run build', { cwd: frontendDir, stdio: 'inherit' });

// Ensure dist is duplicated to root/dist and frontendDir/dist for any Vercel outputDirectory setting
const srcDist = path.join(frontendDir, 'dist');
const targets = [
  path.resolve('dist'),
  path.resolve('trustshield-ai/frontend/dist'),
  path.resolve('frontend/dist')
];

for (const target of targets) {
  if (path.resolve(srcDist) !== target) {
    try {
      fs.cpSync(srcDist, target, { recursive: true });
      console.log(`[+] Synced build output to: ${target}`);
    } catch (e) {
      // Ignore
    }
  }
}
console.log('--- TrustShield AI Frontend Build Complete ---');
