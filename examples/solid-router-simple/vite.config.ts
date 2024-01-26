import { ssrx } from '@ssrx/vite/plugin';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ isSsrBuild, command }) => ({
  plugins: [tsconfigPaths(), solid({ ssr: true }), ssrx()],

  build: {
    rollupOptions: {
      output: {
        // Example of how one could break out larger more stable 3rd party libs into separate chunks for
        // improved preloading
        manualChunks: !isSsrBuild && command === 'build' ? manualChunks : undefined,
      },
    },
  },
}));

function manualChunks(id: string) {
  if (id.match(/node_modules\/(solid-js|@solidjs)/)) {
    return 'vendor-rendering';
  }
}
