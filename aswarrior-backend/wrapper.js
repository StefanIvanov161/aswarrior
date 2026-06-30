// Keeps index.js running. When index.js exits with code 0 (restart signal),
// it waits 1 second and starts again. Any other exit code = real crash, stops.
const { spawn } = require('child_process');
const path = require('path');

let restarting = false;

function start() {
  console.log('[wrapper] Starting server...');
  const child = spawn(process.execPath, [path.join(__dirname, 'index.js')], {
    stdio: 'inherit',
    cwd:   __dirname,
  });

  child.on('exit', (code) => {
    if (code === 0 && !restarting) {
      restarting = true;
      console.log('[wrapper] Clean exit — restarting in 1 s...');
      setTimeout(() => { restarting = false; start(); }, 1000);
    } else if (code !== 0) {
      console.log(`[wrapper] Server exited with code ${code}. Not restarting.`);
    }
  });
}

start();
