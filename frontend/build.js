import { execSync } from 'child_process';
import fs from 'fs';

try {
  if (fs.existsSync('./frontend/package.json')) {
    console.log('[build.js] Building from repository root...');
    execSync('cd frontend && npm run build', { stdio: 'inherit' });
    if (fs.existsSync('./frontend/dist')) {
      fs.cpSync('./frontend/dist', './dist', { recursive: true });
    }
  } else {
    console.log('[build.js] Building from frontend directory...');
    execSync('npm run build', { stdio: 'inherit' });
    if (fs.existsSync('./dist')) {
      fs.mkdirSync('./frontend', { recursive: true });
      fs.cpSync('./dist', './frontend/dist', { recursive: true });
    }
  }
  console.log('[build.js] Build completed successfully.');
} catch (error) {
  console.error('[build.js] Build failed:', error);
  process.exit(1);
}
