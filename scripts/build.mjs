import { readFile, writeFile, cp, rm, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const suppliedUrl = process.env.SITE_URL || config.siteUrl;
const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
let base = '';
if (suppliedUrl || vercelDomain) {
  const url = new URL(suppliedUrl || 'https://' + vercelDomain);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || (url.pathname !== '/' && url.pathname !== '')) throw new Error('SITE_URL deve ser a origem completa do site, sem caminho, senha ou parâmetros.');
  if (url.search || url.hash) throw new Error('SITE_URL não deve conter parâmetros ou fragmentos.');
  base = url.origin;
}
if (!config.brand || !config.brandMain) throw new Error('Informe brand e brandMain em site.config.json.');
if (config.whatsapp && !/^\d{10,15}$/.test(config.whatsapp)) throw new Error('WhatsApp: informe somente DDI, DDD e número, sem espaços.');
if (config.hours && (!Array.isArray(config.hours) || config.hours.some(h => !h.days || !h.time))) throw new Error('Cada horário precisa dos campos days e time.');
const previewEnvironment = Boolean(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production');
const indexable = Boolean(config.indexing && !config.demo && base && !previewEnvironment);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(src, dist, { recursive: true });

let html = await readFile(path.join(src, 'index.html'), 'utf8');
html = html.replaceAll('__BRAND_MAIN__', escapeHtml(config.brandMain)).replaceAll('__BRAND_SUFFIX__', escapeHtml(config.brandSuffix || ''));
html = html.replaceAll('Pata & Cia.', escapeHtml(config.brand));
html = html.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="' + (indexable ? 'index,follow' : 'noindex,nofollow') + '">');
const schema = { '@context': 'https://schema.org', '@type': 'WebPage', name: config.brand + (config.demo ? ' — Petshop demonstrativo' : ' — Petshop'), description: config.demo ? 'Demonstração de site de petshop com serviços, produtos, localização e contato.' : 'Petshop com informações sobre cuidados, produtos e contato.', inLanguage: 'pt-BR' };
if (base) schema.url = base + '/';
html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '<script type="application/ld+json">' + json(schema) + '</script>');
if (base) html = html.replaceAll('__SITE_URL__', escapeHtml(base));
else html = html.split('\n').filter(line => !line.includes('__SITE_URL__')).join('\n');
if (config.searchConsoleVerification) {
  if (!/^[A-Za-z0-9_-]+$/.test(config.searchConsoleVerification)) throw new Error('Token de verificação do Search Console inválido.');
  html = html.replace('</head>', '  <meta name="google-site-verification" content="' + config.searchConsoleVerification + '">\n</head>');
}
if (!config.demo) html = html.replaceAll('Conheça nosso petshop demonstrativo.', 'Conheça nosso petshop.').replaceAll('uma proposta de petshop', 'um petshop');
await writeFile(path.join(dist, 'index.html'), html);
const publicConfig = { ...config, siteUrl: base };
await writeFile(path.join(dist, 'config.js'), '/* Dados públicos gerados de site.config.json. */\nwindow.PETSHOP_CONFIG = ' + json(publicConfig) + ';\n');
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + (indexable ? '\n  <url><loc>' + escapeHtml(base) + '/</loc></url>\n' : '\n') + '</urlset>\n';
await writeFile(path.join(dist, 'sitemap.xml'), sitemap);
await writeFile(path.join(dist, 'robots.txt'), 'User-agent: *\n' + (indexable ? 'Allow: /\nSitemap: ' + base + '/sitemap.xml\n' : 'Disallow: /\n# Versão demonstrativa, local ou de preview.\n'));
// Compilação sem dependências: validação sintática antes da entrega.
new vm.Script(await readFile(path.join(dist, 'app.js'), 'utf8'));
new vm.Script(await readFile(path.join(dist, 'config.js'), 'utf8'));
console.log('Site gerado em dist/. Indexação: ' + (indexable ? 'habilitada' : 'desabilitada') + '.');
if (!base) console.log('Prévia local: metadados de domínio serão preenchidos no deploy da Vercel.');
