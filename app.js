// Hostinger entry point — requires a .js file.
// Uses the running Node binary with --import tsx to handle TypeScript.
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

const proc = spawn(
  process.execPath,
  ['--import', 'tsx', 'server.ts'],
  {
    stdio: 'inherit',
    env: process.env,
    cwd: __dir,
  }
);

proc.on('error', (err) => {
  console.error('[app.js] Failed to start server:', err.message);
  process.exit(1);
});

proc.on('close', (code) => process.exit(code ?? 1));
