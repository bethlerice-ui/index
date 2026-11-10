
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const booking = require('./api/booking');

const port = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  if (req.url?.split('?')[0] === '/api/booking') {
    let body = '';

    for await (const chunk of req) {
      body += chunk;
    }

    try {
      req.body = body ? JSON.parse(body) : {};
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        ok: false,
        message: 'Invalid JSON'
      }));
    }

    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };

    return booking(req, res);
  }

  const urlPath = decodeURIComponent(req.url?.split('?')[0] || '/');
  const requestedPath = urlPath === '/' ? '/index.html' : urlPath;
  const blocked = ['/api/', '/server.js', '/.git/', '/.env', '/package.json'];

if (blocked.some(p => requestedPath === p || requestedPath.startsWith(p))) {
  res.writeHead(404);
  return res.end('Not found');
}
  const filePath = path.resolve(__dirname, '.' + requestedPath);

  if (!filePath.startsWith(__dirname + path.sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (error, contents) => {
    if (error) {
      res.writeHead(404);
      return res.end('Not found');
    }

    const types = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };

    res.setHeader(
      'Content-Type',
      types[path.extname(filePath)] || 'application/octet-stream'
    );
    res.end(contents);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Portfolio running on port ${port}`);
});
