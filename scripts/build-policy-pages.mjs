import { build } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

await build({
    configFile: false,
    logLevel: 'warn',
    build: {
        ssr: true,
        outDir: 'dist-ssr',
        emptyOutDir: true,
        rollupOptions: {
            input: { 'policy-document': 'src/policy-document.tsx', 'prerender-app': 'src/prerender-app.tsx' },
            output: { entryFileNames: '[name].mjs' },
        },
    },
});

const shell = await readFile('dist/index.html', 'utf8');
const stylesheets = [...shell.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map(match => match[1]);
assert(stylesheets.length, 'The built app stylesheet must be available to policy documents.');

/* ── Policy documents: complete HTML with no scripts or frames ── */

const { policyPaths, renderPolicyDocument } = await import(pathToFileURL(resolve('dist-ssr/policy-document.mjs')));
for (const path of policyPaths) {
    const html = renderPolicyDocument(path, stylesheets);
    assert(!/<script\b|<iframe\b/i.test(html), `${path} must remain free of scripts and tracking frames.`);
    assert(html.includes(`href="https://aullevo.com/${path}"`), `${path} must have its own canonical URL.`);
    assert(/<h1\b/.test(html), `${path} must contain readable, prerendered content.`);
    await writeFile(`dist/${path}.html`, html);
}
console.log(`Published ${policyPaths.length} static policy/support documents without advertising or analytics scripts.`);

/* ── Content pages: the normal app shell (AdSense and analytics included) with the page's text pre-rendered ── */

// The empty shell keeps serving every other SPA route (vercel.json falls back to /app.html)
await writeFile('dist/app.html', shell);

// Browser-only globals the theme provider reads while rendering
globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.window ??= globalThis;

const { appPaths, renderAppPage } = await import(pathToFileURL(resolve('dist-ssr/prerender-app.mjs')));

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const unesc = s => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const attr = (markup, re) => { const m = markup.match(re); return m ? unesc(m[1]) : null; };

for (const path of appPaths) {
    let body = renderAppPage(path);
    // React renders the page's <SEO> tags inline: lift them into <head> instead
    const title = attr(body, /<title>([^<]*)<\/title>/);
    const description = attr(body, /<meta name="description" content="([^"]*)"/);
    const canonical = attr(body, /<link rel="canonical" href="([^"]*)"/);
    assert(title && description && canonical, `${path} must set a title, description and canonical URL.`);
    body = body
        .replace(/<title>[^<]*<\/title>/g, '')
        .replace(/<meta (?:name|property)="(?:description|keywords|og:[^"]+|twitter:[^"]+)" content="[^"]*"\/?>/g, '')
        .replace(/<link rel="canonical" href="[^"]*"\/?>/g, '');

    let html = shell
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
        .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${esc(description)}" />`)
        .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${esc(canonical)}" />`)
        .replace(/(<meta\s+property="og:url"\s+content=")[^"]*/, `$1${esc(canonical)}`)
        .replace(/(<meta\s+property="og:title"\s+content=")[^"]*/, `$1${esc(title)}`)
        .replace(/(<meta\s+property="og:description"\s+content=")[^"]*/, `$1${esc(description)}`)
        .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*/, `$1${esc(title)}`)
        .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*/, `$1${esc(description)}`);
    // The home page's structured data (FAQ, HowTo, …) describes the home page only
    if (path !== '/') html = html.replace(/\s*<!-- \d · [^>]*-->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
    html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);

    assert(html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'), `${path} must keep the AdSense tag.`);
    assert(/<h1\b/.test(body), `${path} must contain a pre-rendered heading.`);
    const file = path === '/' ? 'dist/index.html' : `dist${path}.html`;
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html);
}
console.log(`Pre-rendered ${appPaths.length} content pages.`);
