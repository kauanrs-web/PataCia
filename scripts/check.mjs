import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = path.join(root, 'dist');
const html = await readFile(path.join(dist, 'index.html'), 'utf8');
const css = await readFile(path.join(dist, 'styles.css'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Há IDs duplicados.');
assert.equal((html.match(/<h1\b/g) || []).length, 4, 'Cada uma das quatro telas precisa de seu título principal.');
assert(!/__SITE_URL__|__BRAND_/.test(html), 'Há marcadores não processados.');
const localFiles = new Set();
for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  const value = match[1];
  if (value.startsWith('#')) assert(ids.includes(value.slice(1)), 'Âncora inexistente: ' + value);
  else if (!/^(https?:|mailto:|tel:|data:)/.test(value)) localFiles.add(value);
}
for (const match of html.matchAll(/srcset="([^"]+)"/g)) match[1].split(',').forEach(item => localFiles.add(item.trim().split(' ')[0]));
for (const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) if (!match[1].startsWith('data:')) localFiles.add(match[1]);
for (const file of localFiles) { const info = await stat(path.join(dist, file)); assert(info.isFile() && info.size > 0, 'Arquivo ausente ou vazio: ' + file); }
for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
for (const file of ['app.js','config.js']) new vm.Script(await readFile(path.join(dist, file), 'utf8'));
for (const file of ['favicon.ico','favicon-16x16.png','favicon-32x32.png','apple-touch-icon.png','robots.txt','sitemap.xml','assets/social.jpg']) await stat(path.join(dist,file));
const vercel = JSON.parse(await readFile(path.join(root, 'vercel.json'),'utf8'));
assert.equal(vercel.outputDirectory,'dist'); assert.equal(vercel.buildCommand,'npm run build'); assert.equal(vercel.installCommand,'npm ci');
assert(css.includes('prefers-reduced-motion'), 'Falta suporte a movimento reduzido.');
assert(html.includes('class="skip-link"'), 'Falta link para pular ao conteúdo.');
const configContext = { window: {} }; vm.runInNewContext(await readFile(path.join(dist,'config.js'),'utf8'),configContext);
assert.equal(typeof configContext.window.PETSHOP_CONFIG.brand,'string');
console.log('OK: '+localFiles.size+' recursos locais, âncoras, IDs, JavaScript, JSON-LD, ícones, SEO e configuração Vercel.');
