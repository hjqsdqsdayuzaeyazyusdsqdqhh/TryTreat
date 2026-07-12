const fs = require('fs');
const path = require('path');
const root = process.argv[2] || 'C:\\Users\\khalid\\OneDrive\\Desktop\\TryTreat';

function walk(dir) {
  const files = [];
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (!['node_modules', 'data', 'scripts', 'assets'].includes(f)) {
        files.push(...walk(p));
      }
    } else if (f === 'index.html') {
      files.push(p);
    }
  });
  return files;
}

const pages = walk(root);
const checks = [
  { name: 'title', regex: /<title>/ },
  { name: 'meta description', regex: /<meta name="description"/ },
  { name: 'canonical', regex: /<link rel="canonical"/ },
  { name: 'OG title', regex: /<meta property="og:title"/ },
  { name: 'OG description', regex: /<meta property="og:description"/ },
  { name: 'Twitter card', regex: /<meta name="twitter:card"/ },
  { name: 'JSON-LD', regex: /application\/ld\+json/ },
  { name: 'robots meta', regex: /<meta name="robots" content="(index|noindex)/ },
  { name: 'style.css', regex: /<link rel="stylesheet" href="\/assets\/css\/style.css/ },
  { name: 'templates.css', regex: /<link rel="stylesheet" href="\/assets\/css\/templates.css/ },
  { name: 'main.js', regex: /<script src="\/assets\/js\/main.js/ },
  { name: 'templates.js', regex: /<script src="\/assets\/js\/templates.js/ },
  { name: 'skip-link', regex: /class="skip-link"/ },
  { name: 'breadcrumb', regex: /class="breadcrumb"/, skip: ['index.html'] },
  { name: 'footer', regex: /class="footer"/ },
  { name: 'lang="en"', regex: /lang="en"/ },
  { name: 'viewport', regex: /name="viewport"/ },
  { name: 'favicon', regex: /favicon\.svg/ },
  { name: 'manifest', regex: /manifest\.webmanifest/ },
  { name: 'theme-color', regex: /name="theme-color"/ },
];

const failures = [];
pages.forEach(p => {
  const rel = path.relative(root, p).replace(/\\/g, '/');
  const content = fs.readFileSync(p, 'utf8');
  const missing = [];
  checks.forEach(c => {
    if (c.skip && c.skip.includes(rel)) return;
    if (!c.regex.test(content)) missing.push(c.name);
  });
  if (missing.length) {
    failures.push({ page: rel, missing: missing });
  }
});

if (failures.length === 0) {
  console.log('PASSED: All ' + pages.length + ' pages have all ' + checks.length + ' SEO elements');
} else {
  console.log('FAILURES: ' + failures.length + ' of ' + pages.length + ' pages:');
  failures.forEach(f => {
    console.log('  ' + f.page + ': missing ' + f.missing.join(', '));
  });
}
