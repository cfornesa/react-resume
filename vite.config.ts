// Vite configuration file for the React resume project
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Export the Vite configuration
export default defineConfig({
  // Register plugins for React and Tailwind CSS
  plugins: [react(), tailwindcss()],
  // Define path aliases for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  // Server configuration for development mode
  server: {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify — file watching is disabled to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
