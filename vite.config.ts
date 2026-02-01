import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Fix lodash ESM compatibility issue with recharts
      "lodash": "lodash-es",
    },
  },
  build: {
    // Use esbuild for faster, more reliable minification
    minify: 'esbuild' as const,
    // Disable source maps for production
    sourcemap: false,
    // Simpler chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Target modern browsers
    target: 'es2020',
    // Compress assets
    assetsInlineLimit: 4096,
    reportCompressedSize: true,
  },
  // Optimize dependencies - include all frequently used deps to prevent 504 errors
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'clsx',
      'tailwind-merge',
      'recharts',
      'lodash-es',
      '@radix-ui/react-dialog',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-tabs',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
    ],
  },
  // Enable esbuild for faster transforms
  esbuild: {
    legalComments: 'none' as const,
    treeShaking: true,
  },
}));
