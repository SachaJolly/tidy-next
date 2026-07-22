/**
 * sync-figma-icons.mjs
 *
 * Fetches icon components from a Figma file and updates src/app/components/icon/icons.tsx.
 *
 * Setup:
 *   1. Add to .env.local:
 *        FIGMA_TOKEN=your_personal_access_token
 *        FIGMA_FILE_KEY=your_file_key          (from the Figma URL: figma.com/design/<FILE_KEY>/...)
 *        FIGMA_ICONS_PAGE=Icons                (name of the page in Figma, default: "Icons")
 *        FIGMA_ICONS_FRAMES=Navigation,Actions,Media   (comma-separated frame/section names, optional)
 *
 *   2. Run:
 *        node scripts/sync-figma-icons.mjs
 *
 * How it works:
 *   - Finds all components (or top-level frames) whose name matches icon naming conventions
 *   - Exports them as SVG via the Figma Images API
 *   - Strips width/height/xmlns and normalises colours to currentColor
 *   - Writes the icons object to icons.tsx in the same format as the existing file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── Config ──────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) throw new Error('.env.local not found');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  }
}

loadEnv();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = process.env.FIGMA_FILE_KEY;
const ICONS_PAGE_NAME = process.env.FIGMA_ICONS_PAGE ?? 'Icons';
const ICONS_FRAME_NAMES = process.env.FIGMA_ICONS_FRAMES
  ? process.env.FIGMA_ICONS_FRAMES.split(',').map((s) => s.trim()).filter(Boolean)
  : [];

if (!FIGMA_TOKEN || !FILE_KEY) {
  console.error('❌  Set FIGMA_TOKEN and FIGMA_FILE_KEY in .env.local');
  process.exit(1);
}

const OUTPUT_PATH = path.join(ROOT, 'src/app/components/icon/icons.tsx');

// ─── Figma API helpers ────────────────────────────────────────────────────────

async function figmaGet(endpoint) {
  const res = await fetch(`https://api.figma.com/v1${endpoint}`, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN },
  });
  if (!res.ok) throw new Error(`Figma API ${endpoint} → ${res.status} ${await res.text()}`);
  return res.json();
}

// ─── Find icon nodes ──────────────────────────────────────────────────────────

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function slugify(name) {
  // "Icon / Search" → "search", "icon_back" → "back", "Search Icon" → "search"
  return name
    .replace(/icon/gi, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    || name.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function collectIconNodes(node, parentName = '') {
  const results = [];

  // If ICONS_FRAME_NAME is set, only descend into that frame
  if (node.type === 'CANVAS') {
    for (const child of node.children ?? []) {
      results.push(...collectIconNodes(child, node.name));
    }
    return results;
  }

  if (ICONS_FRAME_NAMES.length && ['FRAME', 'SECTION'].includes(node.type) && !ICONS_FRAME_NAMES.map(normalize).includes(normalize(node.name))) {
    return results;
  }

  if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
    results.push({ id: node.id, name: slugify(node.name) });
    return results;
  }

  // For frames/groups that are NOT components, treat direct children that are
  // COMPONENT or FRAME as individual icons
  if (['FRAME', 'GROUP', 'SECTION'].includes(node.type)) {
    for (const child of node.children ?? []) {
      results.push(...collectIconNodes(child, node.name));
    }
  }

  return results;
}

// ─── SVG normalisation ────────────────────────────────────────────────────────

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function normaliseSvg(svgRaw) {
  let svg = svgRaw
    // Remove XML declaration
    .replace(/<\?xml[^>]*\?>/g, '')
    // Remove width/height attributes from <svg>
    .replace(/\s(width|height)="[^"]*"/g, '')
    // Remove xmlns (added back via spread props in TSX)
    .replace(/\s?xmlns(:[a-z]+)?="[^"]*"/g, '')
    // Remove fill from child elements (path, circle, etc.) — inherited from SVG props
    .replace(/(<(?!svg)[a-zA-Z]+[^>]*?)\s+fill="[^"]*"/g, '$1')
    // Normalise stroke colours
    .replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"')
    // Self-close empty tags
    .replace(/<(path|circle|rect|polygon|polyline|line|ellipse)([^/]*)><\/\1>/g, '<$1$2/>')
    .trim();

  // Convert all kebab-case SVG attributes to camelCase for JSX
  svg = svg.replace(/([a-zA-Z]+)-([a-zA-Z]+)=/g, (match, p1, p2) => {
    return `${toCamelCase(p1 + '-' + p2)}=`;
  });

  return svg;
}

function extractInnerSvg(svgRaw) {
  // Extract only the content inside <svg ...>...</svg> for the TSX template
  const match = svgRaw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  return match ? match[1].trim() : svgRaw;
}

function buildSvgTag(innerContent) {
  return `<svg {...solidSvgProps}>\n          ${innerContent}\n        </svg>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('📐  Fetching Figma file…');
  const file = await figmaGet(`/files/${FILE_KEY}?depth=4`);

  const pages = file.document.children;
  const iconPage = pages.find((p) => normalize(p.name) === normalize(ICONS_PAGE_NAME));

  if (!iconPage) {
    console.error(`❌  Page "${ICONS_PAGE_NAME}" not found. Available pages:`);
    pages.forEach((p) => console.error(`     - "${p.name}"`));
    process.exit(1);
  }

  console.log(`📄  Using page "${iconPage.name}"`);

  const iconNodes = collectIconNodes(iconPage);

  if (iconNodes.length === 0) {
    console.error(
      `❌  No icon components found on page "${iconPage.name}".` +
        (ICONS_FRAME_NAMES.length ? ` (looking inside frames: ${ICONS_FRAME_NAMES.join(', ')})` : ''),
    );
    console.error(
      '   Tip: set FIGMA_ICONS_PAGE and FIGMA_ICONS_FRAMES in .env.local to narrow the search.',
    );
    process.exit(1);
  }

  console.log(`🎨  Found ${iconNodes.length} icon(s): ${iconNodes.map((n) => n.name).join(', ')}`);

  // Deduplicate by name (keep first occurrence)
  const seen = new Set();
  const unique = iconNodes.filter(({ name }) => (seen.has(name) ? false : seen.add(name)));

  // Batch export as SVG (Figma limits to 100 ids per request)
  const BATCH = 100;
  const svgMap = {};

  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);
    const ids = batch.map((n) => n.id).join(',');
    console.log(`⬇️   Exporting SVGs (batch ${Math.floor(i / BATCH) + 1})…`);
    const imgRes = await figmaGet(`/images/${FILE_KEY}?ids=${ids}&format=svg&svg_include_id=false&svg_simplify_stroke=true`);

    for (const node of batch) {
      const url = imgRes.images[node.id];
      if (!url) {
        console.warn(`⚠️  No image URL for "${node.name}" (${node.id})`);
        continue;
      }
      const svgRes = await fetch(url);
      const svgRaw = await svgRes.text();
      svgMap[node.name] = normaliseSvg(svgRaw);
    }
  }

  // Parse existing icons from icons.tsx and merge (Figma icons overwrite existing ones)
  const existingEntries = {};
  if (fs.existsSync(OUTPUT_PATH)) {
    const existing = fs.readFileSync(OUTPUT_PATH, 'utf8');
    const matches = existing.matchAll(/^\s{2}(\w+):\s*\(([\s\S]*?)\n\s{2}\)/gm);
    for (const [, name, body] of matches) {
      existingEntries[name] = body.trim();
    }
  }

  // Build icons.tsx content
  const newEntries = {};
  for (const [name, svgRaw] of Object.entries(svgMap)) {
    const inner = extractInnerSvg(svgRaw);
    newEntries[name] = buildSvgTag(inner);
  }

  const merged = { ...existingEntries };
  for (const [name, svgTag] of Object.entries(newEntries)) {
    merged[name] = svgTag;
  }

  const entries = Object.entries(merged)
    .map(([name, svgTag]) => `  ${name}: (\n    ${svgTag}\n  )`)
    .join(',\n');

  const output = `/**
 * Icon Registry
 * All icons are React components that return SVG elements
 * They use 'currentColor' for stroke/fill inheritance
 *
 * ⚠️  Auto-generated by scripts/sync-figma-icons.mjs — do not edit manually.
 *    Run \`node scripts/sync-figma-icons.mjs\` to regenerate.
 */

const solidSvgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'currentColor',
} as const;

export const icons = {
${entries},
} as const;

export type IconName = keyof typeof icons;
`;

  fs.writeFileSync(OUTPUT_PATH, output, 'utf8');
  console.log(`✅  ${Object.keys(newEntries).length} icons from Figma, ${Object.keys(merged).length} total → ${path.relative(ROOT, OUTPUT_PATH)}`);

  // Update icon.stories.tsx options
  const STORIES_PATH = path.join(ROOT, 'src/app/components/icon/icon.stories.tsx');
  if (fs.existsSync(STORIES_PATH)) {
    const iconNames = Object.keys(merged);
    const optionsStr = iconNames.map((n) => `'${n}'`).join(', ');
    const stories = fs.readFileSync(STORIES_PATH, 'utf8');
    const updated = stories.replace(
      /options:\s*\[[^\]]*\]/,
      `options: [${optionsStr}]`,
    );
    fs.writeFileSync(STORIES_PATH, updated, 'utf8');
    console.log(`📖  Updated icon.stories.tsx options (${iconNames.length} icons)`);
  }
}

main().catch((err) => {
  console.error('❌ ', err.message);
  process.exit(1);
});
