// Hostinger entry point — requires a .js file.
// Registers tsx as a TypeScript loader so server.ts can run directly.
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('tsx/esm', pathToFileURL('./'));

await import('./server.ts');
