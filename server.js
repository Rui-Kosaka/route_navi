'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const ROOT = __dirname;
const CONTENT_TYPES = {
  '.css':'text/css; charset=utf-8',
  '.html':'text/html; charset=utf-8',
  '.js':'application/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8'
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');

  const relativePath = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const filePath = path.resolve(ROOT, relativePath);
  if (!filePath.startsWith(ROOT + path.sep)) {
    response.writeHead(403);
    response.end();
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500);
      response.end();
      return;
    }
    response.writeHead(200, { 'Content-Type':CONTENT_TYPES[path.extname(filePath)] || 'application/octet-stream' });
    response.end(content);
  });
});

server.listen(PORT, () => {
  console.log('Route Navi is running at http://localhost:' + PORT);
});
