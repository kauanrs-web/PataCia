import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon', '.webp':'image/webp', '.jpg':'image/jpeg', '.woff':'font/woff', '.xml':'application/xml', '.txt':'text/plain; charset=utf-8' };
const port = Number(process.env.PORT || 3000);
const server = http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url,'http://localhost');
    const route = decodeURIComponent(url.pathname);
    const filename = path.resolve(root, '.' + (route === '/' ? '/index.html' : route));
    if (filename !== root && !filename.startsWith(root + path.sep)) { res.writeHead(403); res.end('Acesso negado'); return; }
    const data = await readFile(filename); res.writeHead(200,{ 'Content-Type':types[path.extname(filename)] || 'application/octet-stream' }); res.end(data);
  } catch { res.writeHead(404,{ 'Content-Type':'text/plain; charset=utf-8' }); res.end('Página não encontrada.'); }
});
server.listen(port,'127.0.0.1',() => console.log('Abra http://localhost:'+port+' — Ctrl+C para encerrar.'));
