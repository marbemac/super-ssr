import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { renderToStream } from '@ssrx/solid/server';
import { Hono } from 'hono';

import * as entry from '~/entry.server.tsx';

const server = new Hono()
  /**
   * These two serveStatic's will be used to serve production assets.
   * Vite dev server handles assets during development.
   */
  .use('/assets/*', serveStatic({ root: './dist/public' }))
  .use('/favicon.ico', serveStatic({ path: './dist/public/favicon.ico' }))

  .get('*', async c => {
    try {
      const { app } = await entry.render(c.req.raw);

      const { stream, statusCode } = await renderToStream({ app, req: c.req.raw });

      return new Response(stream, { status: statusCode(), headers: { 'Content-Type': 'text/html' } });
    } catch (err: any) {
      /**
       * Handle redirects
       */
      if (err instanceof Response && err.status >= 300 && err.status <= 399) {
        return c.redirect(err.headers.get('Location') || '/', err.status);
      }

      /**
       * In development, pass the error back to the vite dev server to display in the error overlay
       */
      if (import.meta.env.DEV) return err;

      throw err;
    }
  });

/**
 * In development, vite handles starting up the server
 * In production, we need to start the server ourselves
 */
if (import.meta.env.PROD) {
  const port = Number(process.env['PORT'] || 3000);
  serve(
    {
      port,
      fetch: server.fetch,
    },
    () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    },
  );
}

export default server;
