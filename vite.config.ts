import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { historyService } from './server/historyService.js';
import url from 'url';

function historyApiPlugin(): Plugin {
  return {
    name: 'history-api-plugin',
    async configureServer(server) {
      console.log('[Vite Plugin] Initializing Chrome History Service...');
      await historyService.initialize();

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;
        const query = parsedUrl.query;

        res.setHeader('Content-Type', 'application/json');

        try {
          if (pathname === '/api/status') {
            res.end(JSON.stringify(historyService.getStatus()));
            return;
          }

          if (pathname === '/api/calendar') {
            res.end(JSON.stringify(historyService.getCalendarOverview()));
            return;
          }

          if (pathname === '/api/day') {
            const dateStr = String(query.date || '');
            res.end(JSON.stringify(historyService.getDay(dateStr)));
            return;
          }

          if (pathname === '/api/search') {
            const q = String(query.q || '');
            const limit = query.limit ? parseInt(String(query.limit), 10) : 50;
            res.end(JSON.stringify({ query: q, results: historyService.search(q, limit) }));
            return;
          }

          if (pathname === '/api/stats') {
            res.end(JSON.stringify(historyService.getOverallStats()));
            return;
          }

          if (pathname === '/api/sessions') {
            res.end(JSON.stringify(historyService.getSessions()));
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), historyApiPlugin()],
  server: {
    port: 5173,
    host: true
  }
});

