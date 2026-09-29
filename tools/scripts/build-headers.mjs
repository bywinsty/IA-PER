import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { headerPages } from '../header-pages.mjs';
import { renderHeader } from '../templates/header.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(scriptDirectory, '../..');

const markerStart = '<!-- generated:header:start -->';
const markerEnd = '<!-- generated:header:end -->';

function countOccurrences(value, needle) {
  return value.split(needle).length - 1;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizePagePaths(html, page) {
  let normalized = html;

  for (const [legacyPath, targetPath] of Object.entries(page.routes ?? {})) {
    const routePattern = new RegExp(
      `(href\\s*=\\s*["'])${escapeRegExp(legacyPath)}(?=["'#?])`,
      'g'
    );
    normalized = normalized.replace(routePattern, `$1${targetPath}`);
  }

  const assetPattern = /((?:href|src)\s*=\s*["'])(?:\.\.\/)*assets\//g;
  return normalized.replace(assetPattern, `$1${page.assetPrefix ?? ''}assets/`);
}

function replaceHeader(html, page, eol) {
  const starts = countOccurrences(html, markerStart);
  const ends = countOccurrences(html, markerEnd);
  const block = renderHeader(page, { eol });

  if (starts === 1 && ends === 1) {
    const markerPattern = /[ \t]*<!-- generated:header:start -->[\s\S]*?<!-- generated:header:end -->/;
    if (!markerPattern.test(html)) throw new Error(`${page.file}: generated header markers are malformed.`);
    return html.replace(markerPattern, block);
  }

  if (starts !== 0 || ends !== 0) {
    throw new Error(`${page.file}: expected exactly one pair of generated header markers.`);
  }

  const legacyHeaderPattern = /^[ \t]*<header\b[^>]*\bid=(['"])header\1[^>]*>[\s\S]*?^[ \t]*<\/header>/m;
  if (!legacyHeaderPattern.test(html)) {
    throw new Error(`${page.file}: could not find the legacy #header block to migrate.`);
  }
  return html.replace(legacyHeaderPattern, block);
}

function ensureSingleAsset(html, page, { asset, anchor, tag }) {
  const assetPattern = new RegExp(`<${tag}\\b[^>]*\\b(?:href|src)=["']${asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'g');
  const count = (html.match(assetPattern) || []).length;
  if (count > 1) throw new Error(`${page.file}: ${asset} is included more than once.`);
  if (count === 1) return html;

  const anchorPattern = new RegExp(`(^[ \\t]*<${tag}\\b[^>]*\\b(?:href|src)=["']${anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>\\r?\\n?)`, 'm');
  const match = html.match(anchorPattern);
  if (!match) throw new Error(`${page.file}: could not find ${anchor} to place ${asset} beside it.`);

  const indent = match[1].match(/^[ \t]*/)[0];
  const newTag = tag === 'link'
    ? `${indent}<link href="${asset}" rel="stylesheet">${match[1].includes('\r\n') ? '\r\n' : '\n'}`
    : `${indent}<script src="${asset}"></script>${match[1].includes('\r\n') ? '\r\n' : '\n'}`;

  return html.replace(anchorPattern, tag === 'link' ? `${match[1]}${newTag}` : `${newTag}${match[1]}`);
}

function updatePage(html, page) {
  const eol = html.includes('\r\n') ? '\r\n' : '\n';
  let updated = normalizePagePaths(html, page);
  updated = replaceHeader(updated, page, eol);
  updated = ensureSingleAsset(updated, page, {
    tag: 'link',
    asset: `${page.assetPrefix ?? ''}assets/css/header.css`,
    anchor: `${page.assetPrefix ?? ''}assets/css/main.css`
  });
  updated = ensureSingleAsset(updated, page, {
    tag: 'script',
    asset: `${page.assetPrefix ?? ''}assets/js/header.js`,
    anchor: `${page.assetPrefix ?? ''}assets/js/main.js`
  });
  return updated;
}

/** Update every configured header and return the pages that changed. */
export async function buildHeaders({ log = true } = {}) {
  const changed = [];
  for (const page of headerPages) {
    const filePath = path.join(projectRoot, page.file);
    const source = await readFile(filePath, 'utf8');
    const output = updatePage(source, page);
    if (output !== source) {
      await writeFile(filePath, output, 'utf8');
      changed.push(page.file);
    }
  }
  if (log) {
    const summary = changed.length ? changed.join(', ') : 'no changes';
    console.log(`Headers built: ${summary}`);
  }
  return { changed, pages: headerPages };
}

const invokedDirectly = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  await buildHeaders();
}
