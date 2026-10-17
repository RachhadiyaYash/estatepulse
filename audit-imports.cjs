const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, 'src');
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(js|jsx)$/.test(e.name)) files.push(p);
  }
})(SRC);

const rel = (p) => path.relative(SRC, p).split(path.sep).join('/');

function resolveImport(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec);
  const tries = [base, base + '.js', base + '.jsx', path.join(base, 'index.js'), path.join(base, 'index.jsx')];
  for (const t of tries) {
    if (fs.existsSync(t) && fs.statSync(t).isFile()) return t;
  }
  return false;
}

const byBase = {};
for (const f of files) {
  const b = path.basename(f).replace(/\.(jsx?|js)$/, '');
  (byBase[b] = byBase[b] || []).push(f);
}

// match: import ... from 'x'  |  import 'x'  |  export ... from 'x'  |  import('x')
const importRe = /(?:import[\s\w*{},$]*?from\s*|import\s*\(\s*|export[\s\w*{},$]*?from\s*)['"]([^'"]+)['"]/g;

const issues = [];
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  let m;
  importRe.lastIndex = 0;
  while ((m = importRe.exec(src))) {
    const spec = m[1];
    if (!spec.startsWith('.')) continue;
    const r = resolveImport(f, spec);
    if (r === false) {
      const base = path.basename(spec).replace(/\.(jsx?|js)$/, '');
      const cands = byBase[base] || [];
      issues.push({
        file: rel(f),
        spec,
        candidates: cands.map((c) => rel(c)),
      });
    }
  }
}

console.log('BROKEN RELATIVE IMPORTS:', issues.length);
for (const i of issues) {
  console.log(`- ${i.file}\n    from: '${i.spec}'\n    candidates: ${i.candidates.length ? i.cands || i.candidates.join(', ') : 'NONE (module missing)'}`);
}
