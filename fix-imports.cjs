const fs = require('fs');
const path = require('path');
const SRC = path.resolve(__dirname, 'src');

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(js|jsx)$/.test(e.name)) files.push(p);
  }
})(SRC);

function resolve(f, s) {
  const b = path.resolve(path.dirname(f), s);
  for (const t of [b, b + '.js', b + '.jsx', path.join(b, 'index.js'), path.join(b, 'index.jsx')])
    if (fs.existsSync(t) && fs.statSync(t).isFile()) return t;
  return false;
}

const byBase = {};
for (const f of files) {
  const b = path.basename(f).replace(/\.(jsx?|js)$/, '');
  (byBase[b] = byBase[b] || []).push(f);
}
// ambiguous basename -> authoritative target
const FORCE = { auth: path.join(SRC, 'supabase', 'auth.js') };

function relSpec(f, t) {
  let r = path.relative(path.dirname(f), t).split(path.sep).join('/').replace(/\.(jsx?|js)$/, '');
  if (!r.startsWith('.')) r = './' + r;
  return r;
}

const re = /from\s*(['"])([^'"\n]+)\1/g;
let total = 0;
const skipped = [];
for (const f of files) {
  let src = fs.readFileSync(f, 'utf8');
  const rel = path.relative(SRC, f).split(path.sep).join('/');
  const matches = [...src.matchAll(re)];
  for (const m of matches) {
    const spec = m[2];
    if (!spec.startsWith('.')) continue;
    if (resolve(f, spec)) continue;
    const base = path.basename(spec).replace(/\.(jsx?|js)$/, '');
    let target;
    if (FORCE[base]) target = FORCE[base];
    else {
      const c = byBase[base] || [];
      if (c.length !== 1) { skipped.push(`${rel}: '${spec}' (${c.length} candidates)`); continue; }
      target = c[0];
    }
    const ns = relSpec(f, target);
    src = src.split(`from ${m[1]}${spec}${m[1]}`).join(`from ${m[1]}${ns}${m[1]}`);
    total++;
  }
  fs.writeFileSync(f, src);
}
console.log('fixed specifiers:', total);
console.log('SKIPPED (need manual review):');
skipped.forEach((s) => console.log('  - ' + s));
