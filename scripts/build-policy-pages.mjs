import { build } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

await build({
    configFile: false,
    build: {
        ssr: 'src/policy-document.tsx',
        outDir: 'dist-ssr',
        emptyOutDir: true,
        rollupOptions: { output: { entryFileNames: 'policy-document.mjs' } },
    },
});

const { policyPaths, renderPolicyDocument } = await import(pathToFileURL(resolve('dist-ssr/policy-document.mjs')));
const appHtml = await readFile('dist/index.html', 'utf8');
const stylesheets = [...appHtml.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map(match => match[1]);
assert(stylesheets.length, 'The built app stylesheet must be available to policy documents.');

for (const path of policyPaths) {
    const html = renderPolicyDocument(path, stylesheets);
    assert(!/<script\b|<iframe\b/i.test(html), `${path} must remain free of scripts and tracking frames.`);
    assert(html.includes(`href="https://aullevo.com/${path}"`), `${path} must have its own canonical URL.`);
    assert(/<h1\b/.test(html), `${path} must contain readable, prerendered content.`);
    await writeFile(`dist/${path}.html`, html);
}
console.log(`Published ${policyPaths.length} static policy/support documents without advertising or analytics scripts.`);
