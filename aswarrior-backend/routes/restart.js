const router  = require('express').Router();
const { spawn, exec } = require('child_process');
const path = require('path');
const fs   = require('fs');

const FRONTEND_DIR = 'C:\\Users\\stefa\\aswarrior-website';
const VITE_BIN     = path.join(FRONTEND_DIR, 'node_modules', 'vite', 'bin', 'vite.js');
const VITE_LOG     = path.join(FRONTEND_DIR, 'vite-restart.log');

// Kill whatever is on port 5173 then start Vite
// Vite gets a log file for stdout/stderr so it doesn't crash from having no output pipe
function restartFrontend(cb) {
  exec('netstat -ano | findstr ":5173.*LISTENING"', (_err, stdout) => {
    const match = stdout && stdout.match(/LISTENING\s+(\d+)/);
    const pid   = match ? match[1] : null;

    const launchVite = () => {
      const log   = fs.openSync(VITE_LOG, 'a');
      const child = spawn(process.execPath, [VITE_BIN, '--host'], {
        cwd:         FRONTEND_DIR,
        detached:    true,
        stdio:       ['ignore', log, log],
        windowsHide: true,
      });
      child.unref();
      if (cb) cb();
    };

    if (pid && pid !== '0') {
      exec(`taskkill /F /PID ${pid}`, () => setTimeout(launchVite, 800));
    } else {
      launchVite();
    }
  });
}

// Backend restart: just exit with code 0.
// wrapper.js (the parent process) detects the clean exit and restarts index.js.
function restartBackend() {
  setTimeout(() => process.exit(0), 150);
}

// POST /api/admin/restart/backend
router.post('/backend', (req, res) => {
  res.json({ ok: true });
  restartBackend();
});

// POST /api/admin/restart/frontend
router.post('/frontend', (req, res) => {
  restartFrontend();
  res.json({ ok: true });
});

// POST /api/admin/restart/both
router.post('/both', (req, res) => {
  res.json({ ok: true });
  restartFrontend(() => restartBackend());
});

module.exports = router;
