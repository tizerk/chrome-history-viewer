import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { historyService } from './historyService.js';

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

async function startServer() {
  await historyService.initialize();

  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');

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
          const dateStr = String(parsedUrl.query.date || '');
          res.end(JSON.stringify(historyService.getDay(dateStr)));
          return;
        }
        if (pathname === '/api/search') {
          const q = String(parsedUrl.query.q || '');
          const limit = parsedUrl.query.limit ? parseInt(String(parsedUrl.query.limit), 10) : 50;
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
        res.end(JSON.stringify({ error: 'Not found' }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // Static file serving from dist
    let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });

  server.listen(PORT, () => {
    console.log(`History Viewer production server running at http://localhost:${PORT}`);
  });
}

startServer();

