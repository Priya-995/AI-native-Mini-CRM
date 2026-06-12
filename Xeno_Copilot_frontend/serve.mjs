import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '.output/public');
const PORT = process.env.PORT || 3000;

const mime = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
};

createServer((req, res) => {
  let filePath = join(DIST, req.url === '/' ? '/index.html' : req.url);
  if (!existsSync(filePath)) filePath = join(DIST, 'index.html');
  const ext = extname(filePath);
  res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
  res.end(readFileSync(filePath));
}).listen(PORT, '0.0.0.0', () => console.log(`Server running on ${PORT}`));