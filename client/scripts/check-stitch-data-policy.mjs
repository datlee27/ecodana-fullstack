import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const textExtensions = new Set([
  '.html',
  '.htm',
  '.json',
  '.md',
  '.txt',
  '.text',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
]);

const violationChecks = [
  {
    code: 'raw_handlebars',
    description: 'Raw {{...}} placeholder visible in export',
    regex: /{{\s*[\w.[\]-]+\s*}}/g,
  },
  {
    code: 'email',
    description: 'Email-like value',
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  },
  {
    code: 'phone',
    description: 'Phone-like value',
    regex: /(?:\+?84|0)\s?(?:\d[\s.-]?){8,10}\d/g,
  },
  {
    code: 'license_plate',
    description: 'License-plate-like value',
    regex: /\b\d{2}[A-Z](?:[A-Z])?[-\s]?[A-Z0-9]{3,6}(?:\.\d{2})?\b/g,
  },
  {
    code: 'currency_amount',
    description: 'Concrete currency amount',
    regex: /\b\d{1,3}(?:[.,]\d{3})+(?:\s?(?:d|đ|vnd))\b|\b\d{4,}\s?(?:d|đ|vnd)\b/gi,
  },
  {
    code: 'booking_code',
    description: 'Booking code-like value',
    regex: /\b(?:BK|BOOKING|PAYOS)[-_]?\d{2,}(?:[-_]\d+)*\b/gi,
  },
  {
    code: 'vehicle_brand',
    description: 'Concrete vehicle brand/model',
    regex: /\b(?:VinFast|VF\s?e?34|VF\s?5|VF\s?6|VF\s?7|VF\s?8|VF\s?9|Feliz|Evo\s?200|Tesla|Honda|Yamaha|Hyundai|Kia)\b/gi,
  },
  {
    code: 'concrete_date',
    description: 'Concrete date value',
    regex: /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g,
  },
  {
    code: 'annotation_board',
    description: 'Developer annotation board text',
    regex: /\b(?:Developer Annotations?|Data Binding Map|State Variants?|Annotation Board|Handoff Notes?)\b/gi,
  },
  {
    code: 'known_fake_examples',
    description: 'Known fake examples from prior screens',
    regex: /\b(?:Nguyễn Văn A|user@example\.com|09\d{2}\s?\d{3}\s?\d{3}|43A-12345|43A-SAI-DINH-DANG|email@ví-dụ\.com)\b/gi,
  },
];

const usage = [
  'Usage:',
  '  npm run check:stitch-data-policy -- <file-or-dir> [more paths]',
  '',
  'Notes:',
  '  - Use this on Stitch prompt/export files, not the docs folder that intentionally contains examples.',
  '  - The command exits with code 1 when violations are found.',
].join('\n');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error(usage);
  process.exit(1);
}

const collectedFiles = [];
const missingTargets = [];

const shouldScanFile = (filePath) => textExtensions.has(path.extname(filePath).toLowerCase());

const walk = (targetPath) => {
  let stats;
  try {
    stats = statSync(targetPath);
  } catch {
    missingTargets.push(targetPath);
    return;
  }

  if (stats.isDirectory()) {
    for (const entry of readdirSync(targetPath, { withFileTypes: true })) {
      walk(path.join(targetPath, entry.name));
    }
    return;
  }

  if (stats.isFile() && shouldScanFile(targetPath)) {
    collectedFiles.push(targetPath);
  }
};

for (const arg of args) {
  walk(path.resolve(process.cwd(), arg));
}

if (missingTargets.length > 0) {
  console.error('Missing targets:');
  for (const target of missingTargets) {
    console.error(`- ${target}`);
  }
  process.exit(1);
}

if (collectedFiles.length === 0) {
  console.error('No supported text files found to scan.');
  process.exit(1);
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getLineNumber = (source, index) => source.slice(0, index).split('\n').length;

const getLineText = (source, index) => {
  const lines = source.split('\n');
  const lineNumber = getLineNumber(source, index);
  return lines[lineNumber - 1]?.trim() ?? '';
};

const violations = [];

for (const filePath of collectedFiles) {
  const source = readFileSync(filePath, 'utf8');

  for (const check of violationChecks) {
    const regex = new RegExp(check.regex.source, check.regex.flags);
    let match;

    while ((match = regex.exec(source)) !== null) {
      const matchedText = match[0];
      if (check.code === 'license_plate' && /^94f990$/i.test(matchedText.replace('#', ''))) {
        continue;
      }

      violations.push({
        filePath,
        code: check.code,
        description: check.description,
        value: matchedText,
        line: getLineNumber(source, match.index),
        lineText: getLineText(source, match.index),
      });

      if (matchedText.length === 0) {
        regex.lastIndex += 1;
      }
    }
  }
}

if (violations.length === 0) {
  console.log(`PASS: scanned ${collectedFiles.length} file(s), no Stitch data-policy violations found.`);
  process.exit(0);
}

console.error(`FAIL: found ${violations.length} potential Stitch data-policy violation(s).\n`);

for (const violation of violations) {
  const relativePath = path.relative(process.cwd(), violation.filePath) || violation.filePath;
  const safeValue = violation.value.replace(new RegExp(escapeRegExp('\n'), 'g'), '\\n');
  console.error(`[${violation.code}] ${relativePath}:${violation.line}`);
  console.error(`  ${violation.description}: ${safeValue}`);
  if (violation.lineText) {
    console.error(`  > ${violation.lineText}`);
  }
  console.error('');
}

process.exit(1);
