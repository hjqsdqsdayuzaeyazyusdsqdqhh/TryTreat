#!/usr/bin/env node

/* =============================================
   TryTreat Static Site Generator
   Reads JSON data, generates SEO pages
   ============================================= */

'use strict';

const fs = require('fs');
const path = require('path');

/* ---------- Paths ---------- */
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUT_DIR = ROOT;
const SCRIPTS_DIR = __dirname;

/* ---------- Load Data ---------- */
function loadJSON(filename) {
  const raw = fs.readFileSync(path.join(DATA_DIR, filename), 'utf8');
  return JSON.parse(raw);
}

const categories = loadJSON('categories.json');
const offers = loadJSON('offers.json');

/* Load all guide files and merge */
const guideFiles = ['guides.json', 'guides-1.json', 'guides-2.json', 'guides-3.json', 'guides-4.json', 'guides-5.json', 'faq.json', 'comparisons.json', 'evergreen.json'];
const guides = [];
guideFiles.forEach(f => {
  try {
    const items = loadJSON(f);
    guides.push(...items);
  } catch (e) {
    console.error('  Warning: Could not load', f, '-', e.message);
  }
});

const brands = loadJSON('brands.json');
const countries = loadJSON('countries.json');

const BASE = 'https://www.trytreat.com';
const TODAY = new Date().toISOString().split('T')[0];

/* ---------- Helpers ---------- */
function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function writeHTML(relPath, html) {
  const fullPath = path.join(OUT_DIR, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, html, 'utf8');
  console.log('  Generated:', relPath);
}

function writeJSON(relPath, data) {
  const fullPath = path.join(OUT_DIR, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('  Generated:', relPath);
}

/* =============================================
   PARTIALS
   ============================================= */

/* ---------- Head ---------- */
function partialHead(opts) {
  const { title, description, canonical, ogType, extraJsonLd, noindex, publishedTime, modifiedTime } = opts;
  let meta = '';
  meta += `  <meta charset="UTF-8">\n`;
  meta += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
  meta += `  <title>${esc(title)}</title>\n`;
  meta += `  <meta name="description" content="${esc(description)}">\n`;
  meta += `  <meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow'}">\n`;
  meta += `  <link rel="canonical" href="${BASE}${canonical}">\n`;
  meta += `  <meta property="og:type" content="${ogType || 'website'}">\n`;
  meta += `  <meta property="og:title" content="${esc(title)}">\n`;
  meta += `  <meta property="og:description" content="${esc(description)}">\n`;
  meta += `  <meta property="og:url" content="${BASE}${canonical}">\n`;
  meta += `  <meta property="og:site_name" content="TryTreat">\n`;
  meta += `  <meta property="og:locale" content="en_US">\n`;
  meta += `  <meta name="twitter:card" content="summary_large_image">\n`;
  meta += `  <meta name="twitter:title" content="${esc(title)}">\n`;
  meta += `  <meta name="twitter:description" content="${esc(description)}">\n`;
  if (publishedTime) meta += `  <meta property="article:published_time" content="${publishedTime}">\n`;
  if (modifiedTime) meta += `  <meta property="article:modified_time" content="${modifiedTime}">\n`;
  meta += `  <link rel="icon" type="image/svg+xml" href="/assets/favicon/favicon.svg">\n`;
  meta += `  <link rel="manifest" href="/manifest.webmanifest">\n`;
  meta += `  <meta name="theme-color" content="#2563eb">\n`;
  meta += `  <link rel="preconnect" href="https://fonts.googleapis.com">\n`;
  meta += `  <meta name="author" content="TryTreat">\n`;
  meta += `  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n`;
  meta += `  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">\n`;
  meta += `  <link rel="stylesheet" href="/assets/css/style.css">\n`;
  meta += `  <link rel="stylesheet" href="/assets/css/templates.css">\n`;
  if (extraJsonLd) {
    for (const jld of extraJsonLd) {
      meta += `  <script type="application/ld+json">${JSON.stringify(jld)}</script>\n`;
    }
  }
  return meta;
}

/* ---------- Header ---------- */
function partialHeader(activeSlug) {
  const navItems = [
    { label: 'Home', url: '/', slug: 'home' },
    { label: 'Free Samples', url: '/categories/free-samples/', slug: 'free-samples' },
    { label: 'Product Testing', url: '/categories/product-testing/', slug: 'product-testing' },
    { label: 'Giveaways', url: '/categories/giveaways/', slug: 'giveaways' },
    { label: 'Coupons', url: '/categories/coupons/', slug: 'coupons' },
    { label: 'Guides', url: '/guides/', slug: 'guides' },
  ];
  const navHtml = navItems.map(n =>
    `<a href="${n.url}" class="header__nav-link${activeSlug === n.slug ? ' header__nav-link--active' : ''}">${n.label}</a>`
  ).join('\n        ');

  const mobileNavHtml = navItems.map(n =>
    `<a href="${n.url}" class="mobile-menu__link">${n.label}</a>`
  ).join('\n        ');

  return `  <header class="header" role="banner">
    <div class="container header__inner">
      <a href="/" class="header__logo" aria-label="TryTreat - Home">
        <svg class="header__logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#2563eb"/><path d="M16 6C12 6 9 9 9 13v2h14v-2c0-4-3-7-7-7z" fill="none" stroke="white" stroke-width="1.5"/><path d="M9 15L23 15 22 24C22 25.1 21.1 26 20 26L12 26C10.9 26 10 25.1 10 24L9 15z" fill="white"/><path d="M12 15L12 22C12 22.6 12.4 23 13 23 13.6 23 14 22.6 14 22L14 15" fill="#2563eb"/><path d="M18 15L18 22C18 22.6 18.4 23 19 23 19.6 23 20 22.6 20 22L20 15" fill="#2563eb"/><path d="M16 15L16 24" stroke="#2563eb" stroke-width="1"/><rect x="14" y="8" width="4" height="4" rx="1" fill="white"/><rect x="11" y="10" width="2" height="2" rx="1" fill="white"/><rect x="19" y="10" width="2" height="2" rx="1" fill="white"/></svg>
        <span class="header__logo-text">TryTreat</span>
      </a>
      <nav class="header__nav" role="navigation" aria-label="Main navigation">
        ${navHtml}
      </nav>
      <div class="header__actions">
        <button class="header__icon-btn" aria-label="Search" id="search-toggle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <button class="header__icon-btn" aria-label="Toggle dark mode" id="dark-mode-toggle">
          <svg class="icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg class="icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:none;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button class="header__menu-toggle" aria-label="Open menu" aria-expanded="false" id="menu-toggle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
      <nav class="mobile-menu__nav" aria-label="Mobile navigation">
        ${mobileNavHtml}
      </nav>
    </div>
  </header>`;
}

/* ---------- Search Modal ---------- */
function partialSearchModal() {
  return `  <div class="search-modal" id="search-modal" role="dialog" aria-label="Search" aria-hidden="true">
    <div class="search-modal__backdrop" id="search-backdrop"></div>
    <div class="search-modal__content">
      <div class="search-modal__header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" class="search-modal__input" placeholder="Search free samples, coupons, guides..." aria-label="Search TryTreat" id="search-input" autocomplete="off">
        <button class="search-modal__close" aria-label="Close search" id="search-close"><kbd>ESC</kbd></button>
      </div>
      <div class="search-modal__body"><p class="search-modal__placeholder">Start typing to search...</p></div>
    </div>
  </div>`;
}

/* ---------- Footer ---------- */
function partialFooter() {
  return `  <footer class="footer" role="contentinfo">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a href="/" class="footer__logo" aria-label="TryTreat - Home">
            <svg class="footer__logo-icon" width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#2563eb"/><path d="M16 6C12 6 9 9 9 13v2h14v-2c0-4-3-7-7-7z" fill="none" stroke="white" stroke-width="1.5"/><path d="M9 15L23 15 22 24C22 25.1 21.1 26 20 26L12 26C10.9 26 10 25.1 10 24L9 15z" fill="white"/><path d="M12 15L12 22C12 22.6 12.4 23 13 23 13.6 23 14 22.6 14 22L14 15" fill="#2563eb"/><path d="M18 15L18 22C18 22.6 18.4 23 19 23 19.6 23 20 22.6 20 22L20 15" fill="#2563eb"/><path d="M16 15L16 24" stroke="#2563eb" stroke-width="1"/><rect x="14" y="8" width="4" height="4" rx="1" fill="white"/><rect x="11" y="10" width="2" height="2" rx="1" fill="white"/><rect x="19" y="10" width="2" height="2" rx="1" fill="white"/></svg>
            <span class="footer__logo-text">TryTreat</span>
          </a>
          <p class="footer__desc">Your go-to platform for free samples, coupons, giveaways, and rewards across Europe.</p>
        </div>
        <div class="footer__links">
          <h3 class="footer__heading">Categories</h3>
          <ul class="footer__list">
            <li><a href="/categories/free-samples/">Free Samples</a></li>
            <li><a href="/categories/product-testing/">Product Testing</a></li>
            <li><a href="/categories/giveaways/">Giveaways</a></li>
            <li><a href="/categories/coupons/">Coupons</a></li>
            <li><a href="/categories/cashback/">Cashback</a></li>
            <li><a href="/categories/rewards/">Rewards</a></li>
          </ul>
        </div>
        <div class="footer__links">
          <h3 class="footer__heading">Resources</h3>
          <ul class="footer__list">
            <li><a href="/guides/">Guides</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/sitemap.xml">Sitemap</a></li>
          </ul>
        </div>
        <div class="footer__links">
          <h3 class="footer__heading">Legal</h3>
          <ul class="footer__list">
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/affiliate-disclosure">Affiliate Disclosure</a></li>
            <li><a href="/disclaimer">Disclaimer</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <p class="footer__copy">&copy; ${new Date().getFullYear()} TryTreat. All rights reserved.</p>
        <p class="footer__disclaimer">TryTreat is not affiliated with any brands shown on this site.</p>
      </div>
    </div>
  </footer>`;
}

/* ---------- Breadcrumb ---------- */
function partialBreadcrumb(items) {
  let html = '  <nav class="breadcrumb" aria-label="Breadcrumb"><ol class="breadcrumb__list">';
  items.forEach((item, i) => {
    if (i > 0) html += '<li class="breadcrumb__separator" aria-hidden="true">/</li>';
    if (i === items.length - 1) {
      html += `<li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page">${esc(item.label)}</span></li>`;
    } else {
      html += `<li class="breadcrumb__item"><a href="${item.url}">${esc(item.label)}</a></li>`;
    }
  });
  html += '</ol></nav>';
  return html;
}

/* ---------- Offer Card ---------- */
function partialOfferCard(offer) {
  const badgeClass = offer.type === 'coupon' ? ' offer-card__badge--coupon' :
                     offer.type === 'giveaway' ? ' offer-card__badge--giveaway' : '';
  const tagClass = offer.type === 'coupon' ? ' offer-card__tag--coupon' :
                   offer.type === 'giveaway' ? ' offer-card__tag--giveaway' : '';
  const badgeLabel = offer.type === 'free-sample' ? 'Free Sample' :
                     offer.type === 'coupon' ? 'Coupon' :
                     offer.type === 'giveaway' ? 'Giveaway' : offer.type;

  return `<a href="${offer.url}" class="offer-card-link">
    <article class="offer-card">
      <div class="offer-card__badge${badgeClass}">${esc(badgeLabel)}</div>
      <div class="offer-card__image" aria-hidden="true">
        <div class="offer-card__image-placeholder">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
      </div>
      <div class="offer-card__body">
        <span class="offer-card__brand">${esc(offer.brand)}</span>
        <h3 class="offer-card__title">${esc(offer.title)}</h3>
        <p class="offer-card__desc">${esc(offer.description)}</p>
        <div class="offer-card__meta">
          <span class="offer-card__tag${tagClass}">${esc(offer.value || 'Free')}</span>
          <span class="offer-card__date">${esc(offer.expiresAt || '')}</span>
        </div>
      </div>
    </article>
  </a>`;
}

/* ---------- Guide Card ---------- */
function partialGuideCard(guide) {
  return `<a href="${guide.url}" class="guide-card-link">
    <article class="guide-card">
      <div class="guide-card__image" aria-hidden="true">
        <div class="guide-card__image-placeholder">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </div>
      </div>
      <div class="guide-card__body">
        <span class="guide-card__category">${esc(guide.category)}</span>
        <h3 class="guide-card__title">${esc(guide.title)}</h3>
        <p class="guide-card__desc">${esc(guide.description)}</p>
        <div class="guide-card__meta">
          <span class="guide-card__read-time">${esc(guide.readTime)}</span>
        </div>
      </div>
    </article>
  </a>`;
}

/* ---------- Category Card ---------- */
function partialCategoryCard(category) {
  const icons = {
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
    scissors: '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
  };
  const svg = icons[category.icon] || icons.heart;

  return `<a href="${category.url}" class="category-card-link">
    <div class="category-card">
      <div class="category-card__icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>
      </div>
      <h3 class="category-card__title">${esc(category.name)}</h3>
      <p class="category-card__desc">${esc(category.shortName)}</p>
    </div>
  </a>`;
}

/* ---------- FAQ ---------- */
function partialFAQ(faqItems, idPrefix) {
  if (!faqItems || !faqItems.length) return '';
  let html = '<div class="faq__list" role="list">';
  faqItems.forEach((item, i) => {
    const uid = `${idPrefix}-faq-${i}`;
    html += `<div class="faq__item" role="listitem">
      <button class="faq__question" aria-expanded="false" aria-controls="${uid}-answer">
        <span>${esc(item.question)}</span>
        <svg class="faq__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="faq__answer" id="${uid}-answer" role="region" aria-hidden="true">
        <p>${esc(item.answer)}</p>
      </div>
    </div>`;
  });
  html += '</div>';
  return html;
}

/* ---------- Sidebar ---------- */
function partialSidebar(opts) {
  const { offer, relatedOffers, relatedGuides, relatedCategories } = opts;
  let html = '<div class="offer-detail__sidebar">';

  /* Offer details */
  html += `<div class="sidebar-card">
    <h3 class="sidebar-card__title">Offer Details</h3>
    <div class="sidebar-card__list">
      <div class="sidebar-card__item"><span class="sidebar-card__dot"></span><span>Value: ${esc(offer.value || 'Free')}</span></div>
      <div class="sidebar-card__item"><span class="sidebar-card__dot"></span><span>Cost: Free</span></div>
      <div class="sidebar-card__item"><span class="sidebar-card__dot"></span><span>Shipping: Free</span></div>
      <div class="sidebar-card__item"><span class="sidebar-card__dot"></span><span>Category: ${esc(offer.categoryName)}</span></div>
    </div>
    <a href="${offer.affiliateUrl || '#'}" class="sidebar-card__cta" role="button" aria-label="Claim this offer">Claim This Offer</a>
  </div>`;

  /* Related offers */
  if (relatedOffers && relatedOffers.length) {
    html += `<div class="sidebar-card"><h3 class="sidebar-card__title">Related Offers</h3><div class="sidebar-card__list">`;
    relatedOffers.forEach(o => {
      html += `<div class="sidebar-card__item"><span class="sidebar-card__dot"></span><a href="${o.url}">${esc(o.title)}</a></div>`;
    });
    html += '</div></div>';
  }

  /* Related guides */
  if (relatedGuides && relatedGuides.length) {
    html += `<div class="sidebar-card"><h3 class="sidebar-card__title">Related Guides</h3><div class="sidebar-card__list">`;
    relatedGuides.forEach(g => {
      html += `<div class="sidebar-card__item"><span class="sidebar-card__dot"></span><a href="${g.url}">${esc(g.title)}</a></div>`;
    });
    html += '</div></div>';
  }

  /* Related categories */
  if (relatedCategories && relatedCategories.length) {
    html += `<div class="sidebar-card"><h3 class="sidebar-card__title">Explore Categories</h3><div class="sidebar-card__list">`;
    relatedCategories.forEach(c => {
      html += `<div class="sidebar-card__item"><span class="sidebar-card__dot"></span><a href="${c.url}">${esc(c.name)}</a></div>`;
    });
    html += '</div></div>';
  }

  html += '</div>';
  return html;
}

/* ---------- CTA Banner ---------- */
function partialCTABanner(title, desc, btnLabel, btnUrl) {
  return `<section class="section section--alt">
    <div class="container">
      <div class="cta-banner">
        <h2 class="cta-banner__title">${esc(title)}</h2>
        <p class="cta-banner__desc">${esc(desc)}</p>
        <a href="${btnUrl}" class="btn btn--primary btn--lg">${esc(btnLabel)}</a>
      </div>
    </div>
  </section>`;
}

/* =============================================
   RELATED CONTENT ENGINE
   ============================================= */

function findRelatedOffers(offer, allOffers, limit) {
  limit = limit || 4;
  const scored = allOffers
    .filter(o => o.id !== offer.id)
    .map(o => {
      let score = 0;
      if (o.category === offer.category) score += 3;
      if (o.brand === offer.brand) score += 2;
      if (o.tags && offer.tags) {
        o.tags.forEach(t => { if (offer.tags.includes(t)) score += 1; });
      }
      return { offer: o, score: score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);
  if (scored.length < limit) {
    const remaining = allOffers
      .filter(o => o.id !== offer.id && !scored.find(s => s.offer.id === o.id));
    remaining.slice(0, limit - scored.length).forEach(o => scored.push({ offer: o, score: 0 }));
  }
  return scored.slice(0, limit).map(x => x.offer);
}

function findRelatedGuides(guide, allGuides, limit) {
  limit = limit || 3;
  const scored = allGuides
    .filter(g => g.id !== guide.id)
    .map(g => {
      let score = 0;
      if (g.categorySlug === guide.categorySlug) score += 3;
      if (g.tags && guide.tags) {
        g.tags.forEach(t => { if (guide.tags.includes(t)) score += 1; });
      }
      return { guide: g, score: score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);
  if (scored.length < limit) {
    const remaining = allGuides
      .filter(g => g.id !== guide.id && !scored.find(s => s.guide.id === g.id));
    remaining.slice(0, limit - scored.length).forEach(g => scored.push({ guide: g, score: 0 }));
  }
  return scored.slice(0, limit).map(x => x.guide);
}

function findRelatedCategories(cat, allCategories, limit) {
  limit = limit || 4;
  return allCategories.filter(c => c.id !== cat.id).slice(0, limit);
}

/* =============================================
   PAGE GENERATORS
   ============================================= */

/* ---------- Category Pages ---------- */
function generateCategoryPages() {
  categories.forEach(cat => {
    const catOffers = offers.filter(o => o.category === cat.id);
    const relatedGuides = findRelatedGuides(
      { id: cat.id, categorySlug: cat.id, tags: cat.seo.keywords || [] },
      guides, 3
    );
    const relatedCats = findRelatedCategories(cat, categories, 4);
    const breadcrumb = partialBreadcrumb([
      { label: 'Home', url: '/' },
      { label: 'Categories', url: '/categories/' },
      { label: cat.name, url: cat.url }
    ]);

    const offerGrid = catOffers.length
      ? catOffers.map(partialOfferCard).join('\n')
      : '<p style="color:var(--color-muted);text-align:center;padding:3rem 1rem;">No offers available yet. Check back soon!</p>';

    const guidesGrid = relatedGuides.map(partialGuideCard).join('\n');
    const faq = partialFAQ(cat.faq, cat.slug);

    const jsonLdBreadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Categories', item: BASE + '/categories/' },
        { '@type': 'ListItem', position: 3, name: cat.name, item: BASE + cat.url }
      ]
    };

    const jsonLdCollection = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: cat.name,
      description: cat.seo.description,
      url: BASE + cat.url,
      isPartOf: { '@type': 'WebSite', name: 'TryTreat', url: BASE }
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
${partialHead({
  title: cat.seo.title,
  description: cat.seo.description,
  canonical: cat.url,
  extraJsonLd: [jsonLdBreadcrumb, jsonLdCollection]
})}
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
${partialHeader(cat.id)}
${partialSearchModal()}

  <main id="main-content">
${breadcrumb}
    <section class="page-hero" aria-labelledby="page-title">
      <div class="container">
        <div class="page-hero__badge">${esc(cat.name)}</div>
        <h1 id="page-title" class="page-hero__title">${esc(cat.name)}</h1>
        <p class="page-hero__desc">${esc(cat.description)}</p>
      </div>
    </section>

    <section class="section" aria-labelledby="offers-title">
      <div class="container">
        <div class="section__header section__header--left">
          <h2 id="offers-title" class="section__title">Available Offers</h2>
          <p class="section__subtitle">Browse current offers in this category</p>
        </div>
        <div class="offer-grid offer-grid--4">
${offerGrid}
        </div>
      </div>
    </section>

    <section class="section section--alt" aria-labelledby="guides-title">
      <div class="container">
        <div class="section__header section__header--left">
          <h2 id="guides-title" class="section__title">Related Guides</h2>
          <p class="section__subtitle">Tips and advice for this category</p>
        </div>
        <div class="guides__grid">
${guidesGrid}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="faq-title">
      <div class="container">
        <div class="section__header">
          <h2 id="faq-title" class="section__title">Frequently Asked Questions</h2>
          <p class="section__subtitle">Common questions about ${esc(cat.name)}</p>
        </div>
${faq}
      </div>
    </section>

${partialCTABanner('Discover More on TryTreat', 'Browse all categories and find the best deals.', 'All Categories', '/categories/')}
  </main>

${partialFooter()}
  <script src="/assets/js/main.js" defer></script>
  <script src="/assets/js/templates.js" defer></script>
</body>
</html>`;

    writeHTML(`categories/${cat.slug}/index.html`, html);
  });
}

/* ---------- Category Hub ---------- */
function generateCategoryHub() {
  const breadcrumb = partialBreadcrumb([
    { label: 'Home', url: '/' },
    { label: 'Categories', url: '/categories/' }
  ]);

  const catGrid = categories.map(partialCategoryCard).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${partialHead({
  title: 'All Categories | Browse Offers | TryTreat',
  description: 'Browse all categories on TryTreat. Free samples, product testing, giveaways, coupons, cashback, and rewards.',
  canonical: '/categories/',
  extraJsonLd: [{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: BASE + '/categories/' }
    ]
  }]
})}
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
${partialHeader('')}
${partialSearchModal()}

  <main id="main-content">
${breadcrumb}
    <section class="page-hero" aria-labelledby="page-title">
      <div class="container">
        <h1 id="page-title" class="page-hero__title">All Categories</h1>
        <p class="page-hero__desc">Browse our categories to find exactly what you're looking for.</p>
      </div>
    </section>
    <section class="section page-content">
      <div class="container">
        <div class="hub-grid">
${catGrid}
        </div>
      </div>
    </section>
  </main>

${partialFooter()}
  <script src="/assets/js/main.js" defer></script>
  <script src="/assets/js/templates.js" defer></script>
</body>
</html>`;

  writeHTML('categories/index.html', html);
}

/* ---------- Offer Pages ---------- */
function generateOfferPages() {
  offers.forEach(offer => {
    const cat = categories.find(c => c.id === offer.category);
    const relOffers = findRelatedOffers(offer, offers, 4);
    const relGuides = findRelatedGuides(
      { id: offer.id, categorySlug: offer.category, tags: offer.tags || [] },
      guides, 3
    );
    const relCats = categories.slice(0, 4);
    const breadcrumb = partialBreadcrumb([
      { label: 'Home', url: '/' },
      { label: 'Offers', url: '/offers/' },
      { label: offer.title, url: offer.url }
    ]);
    const faq = partialFAQ(offer.faq, offer.slug);

    const badgeClass = offer.type === 'coupon' ? ' offer-card__tag--coupon' :
                       offer.type === 'giveaway' ? ' offer-card__tag--giveaway' : '';

    const countryFlag = offer.country && offer.country.length ? offer.country[0] : '';
    const countryName = countryFlag === 'DE' ? 'Germany' :
                        countryFlag === 'FR' ? 'France' :
                        countryFlag === 'NL' ? 'Netherlands' :
                        countryFlag === 'BE' ? 'Belgium' :
                        countryFlag === 'ES' ? 'Spain' :
                        countryFlag === 'IT' ? 'Italy' : 'Worldwide';

    const ctaLabel = offer.type === 'free-sample' ? 'Claim Free Samples' :
                     offer.id === 'edeka' ? 'View Current Offer' :
                     offer.id === 'kaufand' ? 'Explore Rewards' :
                     'View Offer';

    const categoryText = offer.type === 'free-sample' ? 'Free Sample' :
                         offer.type === 'coupon' ? 'Coupon' :
                         offer.type === 'giveaway' ? 'Giveaway' : offer.type;

    const formattedDate = new Date(offer.updatedAt || offer.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    const benefitLines = (offer.benefits || '').split('\n');
    const noteLines = (offer.importantNotes || '').split('\n');

    const creativeFile = `assets/creatives/${offer.slug}.svg`;

    const jsonLdBreadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Offers', item: BASE + '/offers/' },
        { '@type': 'ListItem', position: 3, name: offer.title, item: BASE + offer.url }
      ]
    };

    const jsonLdProduct = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: offer.title,
      description: offer.description,
      brand: { '@type': 'Brand', name: offer.brand },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: BASE + offer.url
      },
      url: BASE + offer.url
    };

    const jsonLdFAQ = offer.faq && offer.faq.length ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: offer.faq.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer }
      }))
    } : null;

    const extraJsonLd = [jsonLdBreadcrumb, jsonLdProduct];
    if (jsonLdFAQ) extraJsonLd.push(jsonLdFAQ);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
${partialHead({
  title: offer.seo.title,
  description: offer.seo.description,
  canonical: offer.url,
  ogType: 'product',
  extraJsonLd
})}
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
${partialHeader(offer.category)}
${partialSearchModal()}

  <main id="main-content">
${breadcrumb}

    <!-- Hero -->
    <section class="page-content">
      <div class="container">
        <div class="offer-detail">
          <div class="offer-detail__banner">
            <div class="offer-detail__banner-bg"></div>
            <div class="offer-detail__banner-content">
              <div class="offer-detail__banner-grid">
                <div class="offer-detail__banner-left">
                  <div class="offer-detail__banner-badges">
                    <span class="offer-card__tag${badgeClass}">${esc(categoryText)}</span>
                    <span class="offer-card__country-badge">${esc(countryName)}</span>
                  </div>
                  <h1 class="offer-detail__banner-title">${esc(offer.title)}</h1>
                  <p class="offer-detail__banner-desc">${esc(offer.description)}</p>
                </div>
                <div class="offer-detail__banner-right">
                  <div class="offer-detail__banner-icon" aria-hidden="true">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="20" y="35" width="60" height="45" rx="6" fill="white" fill-opacity="0.9"/>
                      <rect x="28" y="44" width="16" height="16" rx="3" fill="#2563eb" fill-opacity="0.15"/>
                      <rect x="48" y="44" width="24" height="4" rx="2" fill="#2563eb" fill-opacity="0.1"/>
                      <rect x="48" y="52" width="18" height="4" rx="2" fill="#2563eb" fill-opacity="0.1"/>
                      <rect x="48" y="60" width="22" height="4" rx="2" fill="#2563eb" fill-opacity="0.1"/>
                      <rect x="28" y="68" width="36" height="4" rx="2" fill="#2563eb" fill-opacity="0.1"/>
                      <path d="M50 18L58 32H42L50 18Z" fill="white" fill-opacity="0.8"/>
                      <path d="M35 32L42 18H50" stroke="white" stroke-opacity="0.5" stroke-width="1"/>
                      <circle cx="85" cy="30" r="12" fill="#22c55e" fill-opacity="0.2"/>
                      <path d="M81 30L84 33L89 26" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="offer-detail__content">
            <div class="offer-detail__main">

              <!-- Offer Preview -->
              <div class="offer-detail__preview">
                <div class="offer-detail__preview-label">Offer Preview</div>
                <div class="offer-detail__preview-frame">
                  <img src="/assets/creatives/${offer.slug}.svg" alt="${esc(offer.title)} — premium illustration" class="offer-detail__preview-img" loading="lazy" width="900" height="500">
                </div>
                <p class="offer-detail__preview-caption">Preview provided through our affiliate partner.</p>
              </div>

              <!-- Details Card -->
              <div class="offer-detail__section">
                <div class="offer-detail__details-card">
                  <div class="offer-detail__details-row"><span class="o-d-icon">📍</span> <span class="o-d-label">Country</span> <span class="o-d-value">${esc(countryName)}</span></div>
                  <div class="offer-detail__details-row"><span class="o-d-icon">📂</span> <span class="o-d-label">Category</span> <span class="o-d-value">${esc(offer.categoryName)}</span></div>
                  <div class="offer-detail__details-row"><span class="o-d-icon">🏷️</span> <span class="o-d-label">Offer Type</span> <span class="o-d-value">${esc(categoryText)}</span></div>
                  <div class="offer-detail__details-row"><span class="o-d-icon">💰</span> <span class="o-d-label">Cost</span> <span class="o-d-value">${esc(offer.cost || 'Free')}</span></div>
                  <div class="offer-detail__details-row"><span class="o-d-icon">⏱️</span> <span class="o-d-label">Est. Time</span> <span class="o-d-value">${esc(offer.estimatedTime || 'Few minutes')}</span></div>
                  <div class="offer-detail__details-row"><span class="o-d-icon">📦</span> <span class="o-d-label">Availability</span> <span class="o-d-value">${esc(offer.availability || 'While supplies last')}</span></div>
                  <div class="offer-detail__details-row"><span class="o-d-icon">🔄</span> <span class="o-d-label">Updated</span> <span class="o-d-value">${formattedDate}</span></div>
                  <div class="offer-detail__details-row"><span class="o-d-icon">📱</span> <span class="o-d-label">Mobile Friendly</span> <span class="o-d-value">Yes</span></div>
                </div>
              </div>

              <!-- Overview -->
              <div class="offer-detail__section">
                <h2 class="offer-detail__section-title">Overview</h2>
                <div class="offer-detail__summary-card">
                  <div class="offer-detail__summary-block">
                    <h3 class="offer-detail__summary-label">What is this offer?</h3>
                    <p class="offer-detail__summary-text">${esc(offer.overview || offer.description)}</p>
                  </div>
                  <div class="offer-detail__summary-grid">
                    <div class="offer-detail__summary-col">
                      <h3 class="offer-detail__summary-label">Who can participate</h3>
                      <p class="offer-detail__summary-text">${esc(offer.whoCanParticipate || offer.eligibility)}</p>
                    </div>
                    <div class="offer-detail__summary-col">
                      <h3 class="offer-detail__summary-label">Benefits</h3>
                      <ul class="offer-detail__summary-list">
${benefitLines.map(b => b.trim()).filter(b => b).map(b => `<li class="o-d-check">${esc(b)}</li>`).join('\n')}
                      </ul>
                    </div>
                  </div>
                  <div class="offer-detail__summary-block">
                    <h3 class="offer-detail__summary-label">Important Notes</h3>
                    <ul class="offer-detail__summary-list">
${noteLines.map(n => n.trim()).filter(n => n).map(n => `<li class="o-d-bullet">${esc(n)}</li>`).join('\n')}
                    </ul>
                  </div>
                </div>
              </div>

              <!-- CTA -->
              <div class="offer-detail__sticky-cta-trigger">
              <div class="offer-detail__affirm">
                <a href="${esc(offer.affiliateUrl)}" class="btn btn--primary btn--lg offer-detail__affirm-btn" rel="nofollow sponsored" target="_blank">${esc(ctaLabel)}</a>
                <p class="offer-detail__affirm-disclosure">This page may contain affiliate links. We may receive a commission if you complete a qualifying action. There is no additional cost to you.</p>
              </div>
              </div>

              <!-- Trust Box -->
              <div class="offer-detail__trust-box">
                <div class="offer-detail__trust-item"><span class="o-d-tick">&#10003;</span> Free to Access</div>
                <div class="offer-detail__trust-item"><span class="o-d-tick">&#10003;</span> Secure Redirect</div>
                <div class="offer-detail__trust-item"><span class="o-d-tick">&#10003;</span> Regularly Updated</div>
                <div class="offer-detail__trust-item"><span class="o-d-tick">&#10003;</span> ${countryName} Offer</div>
              </div>

              <!-- How It Works -->
              <div class="offer-detail__section">
                <h2 class="offer-detail__section-title">How It Works</h2>
                <div class="offer-detail__steps">
                  <div class="offer-detail__step">Open the offer and review the details</div>
                  <div class="offer-detail__step">Review eligibility requirements</div>
                  <div class="offer-detail__step">Complete the required registration or request form</div>
                  <div class="offer-detail__step">Continue through the official offer flow</div>
                </div>
              </div>

              <!-- FAQ -->
              ${faq ? `
              <div class="offer-detail__section">
                <h2 class="offer-detail__section-title">Frequently Asked Questions</h2>
                <div class="offer-detail__faq-wrap">
${faq}
                </div>
              </div>` : ''}
            </div>

            <!-- Sidebar -->
            <div class="offer-detail__sidebar">
              <!-- Quick Links -->
              <div class="sidebar-card">
                <h3 class="sidebar-card__title">Quick Links</h3>
                <ul class="sidebar-card__list">
                  <li class="sidebar-card__item"><span class="sidebar-card__dot"></span><a href="#overview">Overview</a></li>
                  <li class="sidebar-card__item"><span class="sidebar-card__dot"></span><a href="#details">Details</a></li>
                  <li class="sidebar-card__item"><span class="sidebar-card__dot"></span><a href="#how-it-works">How It Works</a></li>
                  <li class="sidebar-card__item"><span class="sidebar-card__dot"></span><a href="#faq">FAQ</a></li>
                </ul>
              </div>

              <!-- Related Offers -->
              ${relOffers.length ? `
              <div class="sidebar-card">
                <h3 class="sidebar-card__title">Related Offers</h3>
                <div class="sidebar-card__grid">
${relOffers.slice(0, 3).map(o => `
                  <a href="${o.url}" class="sidebar-card__mini-card">
                    <div class="sidebar-card__mini-badge">${o.categoryName}</div>
                    <div class="sidebar-card__mini-title">${esc(o.title)}</div>
                    <div class="sidebar-card__mini-meta">
                      <span class="sidebar-card__mini-tag">${esc(o.value || 'Free')}</span>
                    </div>
                  </a>`).join('\n')}
                </div>
              </div>` : ''}

              <!-- Related Guides -->
              ${relGuides.length ? `
              <div class="sidebar-card">
                <h3 class="sidebar-card__title">Related Guides</h3>
                <div class="sidebar-card__grid">
${relGuides.slice(0, 3).map(g => `
                  <a href="${g.url}" class="sidebar-card__mini-card">
                    <div class="sidebar-card__mini-badge">${esc(g.category || 'Guide')}</div>
                    <div class="sidebar-card__mini-title">${esc(g.title)}</div>
                    <div class="sidebar-card__mini-meta">
                      <span class="sidebar-card__readtime">${esc(g.readTime || '')}</span>
                    </div>
                  </a>`).join('\n')}
                </div>
              </div>` : ''}
            </div>
          </div>
        </div>
      </div>
    </section>

${partialCTABanner('Discover More Offers', 'Browse all offers on TryTreat.', 'Browse All Offers', '/offers/')}
  </main>

  <div class="offer-detail__sticky-cta">
    <a href="${esc(offer.affiliateUrl)}" class="btn btn--primary btn--lg offer-detail__sticky-btn" rel="nofollow sponsored" target="_blank">${esc(ctaLabel)}</a>
  </div>

${partialFooter()}
  <script src="/assets/js/main.js" defer></script>
  <script src="/assets/js/templates.js" defer></script>
</body>
</html>`;

    writeHTML(`offers/${offer.slug}/index.html`, html);
  });
}

/* ---------- Offer Hub ---------- */
function generateOfferHub() {
  const breadcrumb = partialBreadcrumb([
    { label: 'Home', url: '/' },
    { label: 'Offers', url: '/offers/' }
  ]);

  const offerGrid = offers.map(partialOfferCard).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${partialHead({
  title: 'All Offers | Free Samples, Coupons & Giveaways | TryTreat',
  description: 'Browse all offers on TryTreat. Free samples, coupons, giveaways, cashback deals, and rewards.',
  canonical: '/offers/',
  extraJsonLd: [{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Offers', item: BASE + '/offers/' }
    ]
  }]
})}
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
${partialHeader('')}
${partialSearchModal()}

  <main id="main-content">
${breadcrumb}
    <section class="page-hero" aria-labelledby="page-title">
      <div class="container">
        <h1 id="page-title" class="page-hero__title">All Offers</h1>
        <p class="page-hero__desc">Browse free samples, coupons, giveaways, and deals from top brands.</p>
      </div>
    </section>
    <section class="section page-content">
      <div class="container">
        <div class="offer-grid offer-grid--4">
${offerGrid}
        </div>
      </div>
    </section>
  </main>

${partialFooter()}
  <script src="/assets/js/main.js" defer></script>
  <script src="/assets/js/templates.js" defer></script>
</body>
</html>`;

  writeHTML('offers/index.html', html);
}

/* ---------- Guide Pages ---------- */
function generateGuidePages() {
  guides.forEach(guide => {
    const relGuides = findRelatedGuides(guide, guides, 3).map(partialGuideCard).join('\n');
    const relOffers = findRelatedOffers(
      { id: guide.id, category: guide.categorySlug, tags: guide.tags || [] },
      offers, 3
    ).map(o => `<div class="sidebar-card__item"><span class="sidebar-card__dot"></span><a href="${o.url}">${esc(o.title)}</a></div>`).join('\n');
    const relCats = (guide.relatedCategories || []).map(cid => {
      const c = categories.find(x => x.id === cid);
      return c ? `<div class="sidebar-card__item"><span class="sidebar-card__dot"></span><a href="${c.url}">${esc(c.name)}</a></div>` : '';
    }).join('\n');
    const moreGuides = findRelatedGuides(guide, guides, 3).map(g =>
      `<div class="sidebar-card__item"><span class="sidebar-card__dot"></span><a href="${g.url}">${esc(g.title)}</a></div>`
    ).join('\n');

    const breadcrumb = partialBreadcrumb([
      { label: 'Home', url: '/' },
      { label: 'Guides', url: '/guides/' },
      { label: guide.title, url: guide.url }
    ]);

    const tocItems = (guide.tableOfContents || []).map(t =>
      `<a href="#${t.id}" class="toc__link">${esc(t.title)}</a>`
    ).join('\n');

    const faq = partialFAQ(guide.faq, guide.slug);

    const jsonLdBreadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: BASE + '/guides/' },
        { '@type': 'ListItem', position: 3, name: guide.title, item: BASE + guide.url }
      ]
    };

    const jsonLdArticle = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      description: guide.description,
      author: { '@type': 'Organization', name: guide.author || 'TryTreat Team' },
      publisher: {
        '@type': 'Organization',
        name: 'TryTreat',
        logo: { '@type': 'ImageObject', url: BASE + '/assets/favicon/favicon.svg' }
      },
      datePublished: guide.publishedAt,
      dateModified: guide.updatedAt || guide.publishedAt,
      mainEntityOfPage: { '@type': 'WebPage', '@id': BASE + guide.url }
    };

    const jsonLdFAQ = guide.faq && guide.faq.length ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guide.faq.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.description || f.answer }
      }))
    } : null;

    const extraJsonLd = [jsonLdBreadcrumb, jsonLdArticle];
    if (jsonLdFAQ) extraJsonLd.push(jsonLdFAQ);

    /* Guide body content from sections */
    const bodyContent = guide.sections && guide.sections.length
      ? guide.sections.map(s => `
            <h2 id="${s.id}">${esc(s.title)}</h2>
            ${s.content}
            `).join('\n')
      : `
            <p>${esc(guide.description)}</p>

            ${(guide.tableOfContents || []).map(t => `
            <h2 id="${t.id}">${esc(t.title)}</h2>
            <p>This section covers ${esc(t.title.toLowerCase())}. Detailed content for this section will be populated when the guide is fully written.</p>
            `).join('\n')}

            <p>Ready to start? Browse our current offers and begin saving today.</p>`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
${partialHead({
  title: guide.seo.title,
  description: guide.seo.description,
  canonical: guide.url,
  ogType: 'article',
  publishedTime: guide.publishedAt,
  modifiedTime: guide.updatedAt || guide.publishedAt,
  extraJsonLd
})}
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
${partialHeader('guides')}
${partialSearchModal()}

  <main id="main-content">
${breadcrumb}

    <section class="page-hero" aria-labelledby="page-title">
      <div class="container">
        <div class="page-hero__badge">${esc(guide.category)}</div>
        <h1 id="page-title" class="page-hero__title">${esc(guide.title)}</h1>
        <p class="page-hero__desc">${esc(guide.description)}</p>
      </div>
    </section>

    <section class="guide-article">
      <div class="container">
        <div class="guide-article__content">
          <div class="guide-article__main">
            <div class="guide-article__meta">
              <span class="guide-article__meta-item">By ${esc(guide.author || 'TryTreat Team')}</span>
              <span class="guide-article__meta-item">Updated ${esc(guide.updatedAt || guide.publishedAt)}</span>
              <span class="guide-article__meta-item">${esc(guide.readTime)}</span>
            </div>

            <nav class="toc" aria-label="Table of contents">
              <div class="toc__title">Table of Contents</div>
              <div class="toc__list">
${tocItems}
              </div>
            </nav>

            <div class="guide-body">
${bodyContent}
            </div>

            ${faq ? `
            <div class="offer-detail__section" style="margin-top:3rem;">
              <h2 class="offer-detail__section-title">Frequently Asked Questions</h2>
${faq}
            </div>` : ''}
          </div>

          <div class="guide-article__sidebar">
            ${relOffers ? `<div class="sidebar-card"><h3 class="sidebar-card__title">Related Offers</h3><div class="sidebar-card__list">${relOffers}</div></div>` : ''}
            ${relCats ? `<div class="sidebar-card"><h3 class="sidebar-card__title">Related Categories</h3><div class="sidebar-card__list">${relCats}</div></div>` : ''}
            ${moreGuides ? `<div class="sidebar-card"><h3 class="sidebar-card__title">More Guides</h3><div class="sidebar-card__list">${moreGuides}</div></div>` : ''}
          </div>
        </div>
      </div>
    </section>

${partialCTABanner('Start Collecting Free Samples', 'Browse all free samples available on TryTreat.', 'Browse Free Samples', '/categories/free-samples/')}
  </main>

${partialFooter()}
  <script src="/assets/js/main.js" defer></script>
  <script src="/assets/js/templates.js" defer></script>
</body>
</html>`;

    writeHTML(`guides/${guide.slug}/index.html`, html);
  });
}

/* ---------- Guide Hub ---------- */
function generateGuideHub() {
  const breadcrumb = partialBreadcrumb([
    { label: 'Home', url: '/' },
    { label: 'Guides', url: '/guides/' }
  ]);

  const guideGrid = guides.map(partialGuideCard).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${partialHead({
  title: 'Guides | Tips & Advice for Saving Money | TryTreat',
  description: 'Read our guides on free samples, cashback, product testing, and more.',
  canonical: '/guides/',
  extraJsonLd: [{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: BASE + '/guides/' }
    ]
  }]
})}
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
${partialHeader('guides')}
${partialSearchModal()}

  <main id="main-content">
${breadcrumb}
    <section class="page-hero" aria-labelledby="page-title">
      <div class="container">
        <h1 id="page-title" class="page-hero__title">Guides</h1>
        <p class="page-hero__desc">Tips and advice to help you save money and get the most out of free samples, coupons, and rewards.</p>
      </div>
    </section>
    <section class="section page-content">
      <div class="container">
        <div class="hub-grid">
${guideGrid}
        </div>
      </div>
    </section>
  </main>

${partialFooter()}
  <script src="/assets/js/main.js" defer></script>
  <script src="/assets/js/templates.js" defer></script>
</body>
</html>`;

  writeHTML('guides/index.html', html);
}

/* ---------- Brand Pages ---------- */
function generateBrandPages() {
  brands.forEach(brand => {
    const brandOffers = offers.filter(o => o.brandSlug === brand.slug);
    const relOffers = brandOffers.map(partialOfferCard).join('\n');
    const breadcrumb = partialBreadcrumb([
      { label: 'Home', url: '/' },
      { label: 'Brands', url: '/brands/' },
      { label: brand.name, url: brand.url }
    ]);

    const jsonLdBreadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Brands', item: BASE + '/brands/' },
        { '@type': 'ListItem', position: 3, name: brand.name, item: BASE + brand.url }
      ]
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
${partialHead({
  title: brand.seo.title,
  description: brand.seo.description,
  canonical: brand.url,
  extraJsonLd: [jsonLdBreadcrumb]
})}
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
${partialHeader('')}
${partialSearchModal()}

  <main id="main-content">
${breadcrumb}
    <section class="page-hero" aria-labelledby="page-title">
      <div class="container">
        <div class="page-hero__badge">Brand</div>
        <h1 id="page-title" class="page-hero__title">${esc(brand.name)}</h1>
        <p class="page-hero__desc">${esc(brand.description)}</p>
      </div>
    </section>

    <section class="section" aria-labelledby="offers-title">
      <div class="container">
        <div class="section__header section__header--left">
          <h2 id="offers-title" class="section__title">Offers from ${esc(brand.name)}</h2>
          <p class="section__subtitle">Browse current offers from this brand</p>
        </div>
        <div class="offer-grid offer-grid--4">
${relOffers || '<p style="color:var(--color-muted);text-align:center;padding:3rem 1rem;">No offers available yet for this brand.</p>'}
        </div>
      </div>
    </section>

${partialCTABanner('Browse All Offers', 'Find more deals and free samples.', 'All Offers', '/offers/')}
  </main>

${partialFooter()}
  <script src="/assets/js/main.js" defer></script>
  <script src="/assets/js/templates.js" defer></script>
</body>
</html>`;

    writeHTML(`brands/${brand.slug}/index.html`, html);
  });
}

/* ---------- Brand Hub ---------- */
function generateBrandHub() {
  const breadcrumb = partialBreadcrumb([
    { label: 'Home', url: '/' },
    { label: 'Brands', url: '/brands/' }
  ]);

  const brandCards = brands.map(b => {
    return `<a href="${b.url}" class="category-card-link">
      <div class="category-card">
        <div class="category-card__icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </div>
        <h3 class="category-card__title">${esc(b.name)}</h3>
        <p class="category-card__desc">${esc(b.description).substring(0, 60)}...</p>
      </div>
    </a>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${partialHead({
  title: 'All Brands | Browse Offers by Brand | TryTreat',
  description: 'Browse all brands on TryTreat. Find free samples, coupons, and deals from your favorite brands.',
  canonical: '/brands/',
  extraJsonLd: [{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Brands', item: BASE + '/brands/' }
    ]
  }]
})}
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
${partialHeader('')}
${partialSearchModal()}

  <main id="main-content">
${breadcrumb}
    <section class="page-hero" aria-labelledby="page-title">
      <div class="container">
        <h1 id="page-title" class="page-hero__title">All Brands</h1>
        <p class="page-hero__desc">Browse offers by brand. Find deals from your favorite companies.</p>
      </div>
    </section>
    <section class="section page-content">
      <div class="container">
        <div class="hub-grid">
${brandCards}
        </div>
      </div>
    </section>
  </main>

${partialFooter()}
  <script src="/assets/js/main.js" defer></script>
  <script src="/assets/js/templates.js" defer></script>
</body>
</html>`;

  writeHTML('brands/index.html', html);
}

/* ---------- Country Pages ---------- */
function generateCountryPages() {
  countries.forEach(country => {
    const countryOffers = offers.filter(o => o.country && (o.country.includes(country.code) || o.country.includes('ALL')));
    const relOffers = countryOffers.map(partialOfferCard).join('\n');
    const breadcrumb = partialBreadcrumb([
      { label: 'Home', url: '/' },
      { label: 'Countries', url: '/countries/' },
      { label: country.name, url: country.url }
    ]);

    const jsonLdBreadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Countries', item: BASE + '/countries/' },
        { '@type': 'ListItem', position: 3, name: country.name, item: BASE + country.url }
      ]
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
${partialHead({
  title: country.seo.title,
  description: country.seo.description,
  canonical: country.url,
  extraJsonLd: [jsonLdBreadcrumb]
})}
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
${partialHeader('')}
${partialSearchModal()}

  <main id="main-content">
${breadcrumb}
    <section class="page-hero" aria-labelledby="page-title">
      <div class="container">
        <div class="page-hero__badge">Country</div>
        <h1 id="page-title" class="page-hero__title">${esc(country.name)}</h1>
        <p class="page-hero__desc">Free samples, coupons, giveaways, and deals available in ${esc(country.name)}.</p>
      </div>
    </section>

    <section class="section" aria-labelledby="offers-title">
      <div class="container">
        <div class="section__header section__header--left">
          <h2 id="offers-title" class="section__title">Offers in ${esc(country.name)}</h2>
          <p class="section__subtitle">Browse current offers available in this country</p>
        </div>
        <div class="offer-grid offer-grid--4">
${relOffers || '<p style="color:var(--color-muted);text-align:center;padding:3rem 1rem;">No offers available yet for this country.</p>'}
        </div>
      </div>
    </section>

${partialCTABanner('Browse All Offers', 'Find more deals available worldwide.', 'All Offers', '/offers/')}
  </main>

${partialFooter()}
  <script src="/assets/js/main.js" defer></script>
  <script src="/assets/js/templates.js" defer></script>
</body>
</html>`;

    writeHTML(`countries/${country.slug}/index.html`, html);
  });
}

/* ---------- Country Hub ---------- */
function generateCountryHub() {
  const breadcrumb = partialBreadcrumb([
    { label: 'Home', url: '/' },
    { label: 'Countries', url: '/countries/' }
  ]);

  const countryCards = countries.map(c => {
    return `<a href="${c.url}" class="category-card-link">
      <div class="category-card">
        <div class="category-card__icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        </div>
        <h3 class="category-card__title">${esc(c.name)}</h3>
        <p class="category-card__desc">${esc(c.code)}</p>
      </div>
    </a>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${partialHead({
  title: 'All Countries | Browse Deals by Country | TryTreat',
  description: 'Browse TryTreat offers by country. Find free samples, coupons, and deals available in your country.',
  canonical: '/countries/',
  extraJsonLd: [{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Countries', item: BASE + '/countries/' }
    ]
  }]
})}
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
${partialHeader('')}
${partialSearchModal()}

  <main id="main-content">
${breadcrumb}
    <section class="page-hero" aria-labelledby="page-title">
      <div class="container">
        <h1 id="page-title" class="page-hero__title">All Countries</h1>
        <p class="page-hero__desc">Browse offers available in different European countries.</p>
      </div>
    </section>
    <section class="section page-content">
      <div class="container">
        <div class="hub-grid">
${countryCards}
        </div>
      </div>
    </section>
  </main>

${partialFooter()}
  <script src="/assets/js/main.js" defer></script>
  <script src="/assets/js/templates.js" defer></script>
</body>
</html>`;

  writeHTML('countries/index.html', html);
}

/* =============================================
   AUTO SITEMAP
   ============================================= */

function generateSitemap() {
  const urls = [];

  /* Homepage */
  urls.push({ loc: BASE + '/', priority: '1.0', changefreq: 'daily' });

  /* Category hub + pages */
  urls.push({ loc: BASE + '/categories/', priority: '0.8', changefreq: 'weekly' });
  categories.forEach(c => urls.push({ loc: BASE + c.url, priority: '0.9', changefreq: 'daily' }));

  /* Offer hub + pages */
  urls.push({ loc: BASE + '/offers/', priority: '0.9', changefreq: 'daily' });
  offers.forEach(o => urls.push({ loc: BASE + o.url, priority: '0.7', changefreq: 'weekly' }));

  /* Guide hub + pages */
  urls.push({ loc: BASE + '/guides/', priority: '0.8', changefreq: 'weekly' });
  guides.forEach(g => urls.push({ loc: BASE + g.url, priority: '0.7', changefreq: 'monthly' }));

  /* Brand hub + pages */
  urls.push({ loc: BASE + '/brands/', priority: '0.7', changefreq: 'weekly' });
  brands.forEach(b => urls.push({ loc: BASE + b.url, priority: '0.6', changefreq: 'weekly' }));

  /* Country hub + pages */
  urls.push({ loc: BASE + '/countries/', priority: '0.7', changefreq: 'weekly' });
  countries.forEach(c => urls.push({ loc: BASE + c.url, priority: '0.7', changefreq: 'weekly' }));

  /* Static pages */
  urls.push({ loc: BASE + '/search/', priority: '0.3', changefreq: 'monthly' });
  urls.push({ loc: BASE + '/about', priority: '0.3', changefreq: 'monthly' });
  urls.push({ loc: BASE + '/contact', priority: '0.3', changefreq: 'monthly' });
  urls.push({ loc: BASE + '/privacy-policy', priority: '0.2', changefreq: 'monthly' });
  urls.push({ loc: BASE + '/terms', priority: '0.2', changefreq: 'monthly' });
  urls.push({ loc: BASE + '/disclaimer', priority: '0.2', changefreq: 'monthly' });

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  urls.forEach(u => {
    xml += '  <url>\n';
    xml += `    <loc>${u.loc}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    xml += `    <priority>${u.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  xml += '</urlset>';

  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), xml, 'utf8');
  console.log('  Generated: sitemap.xml');

  /* Sitemap index for future expansion */
  let indexXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  indexXml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  indexXml += '  <sitemap>\n';
  indexXml += `    <loc>${BASE}/sitemap.xml</loc>\n`;
  indexXml += `    <lastmod>${TODAY}</lastmod>\n`;
  indexXml += '  </sitemap>\n';
  indexXml += '</sitemapindex>';

  fs.writeFileSync(path.join(OUT_DIR, 'sitemap-index.xml'), indexXml, 'utf8');
  console.log('  Generated: sitemap-index.xml');
}

/* =============================================
   AUTO ROBOTS.TXT
   ============================================= */

function generateRobots() {
  let txt = '# TryTreat - robots.txt\n';
  txt += '# https://www.trytreat.com\n\n';
  txt += 'User-agent: *\n';
  txt += 'Allow: /\n';
  txt += 'Disallow: /assets/\n';
  txt += 'Disallow: /admin/\n';
  txt += 'Disallow: /api/\n';
  txt += 'Disallow: /data/\n';
  txt += 'Disallow: /scripts/\n\n';
  txt += `Sitemap: ${BASE}/sitemap.xml\n`;

  fs.writeFileSync(path.join(OUT_DIR, 'robots.txt'), txt, 'utf8');
  console.log('  Generated: robots.txt');
}

/* =============================================
   AUTO SEARCH INDEX
   ============================================= */

function generateSearchIndex() {
  const index = [];

  categories.forEach(c => {
    index.push({
      type: 'category',
      title: c.name,
      slug: c.slug,
      category: c.name,
      description: c.description,
      keywords: (c.seo && c.seo.keywords) || [],
      url: c.url
    });
  });

  offers.forEach(o => {
    index.push({
      type: 'offer',
      title: o.title,
      slug: o.slug,
      category: o.categoryName || o.category,
      description: o.description,
      keywords: (o.seo && o.seo.keywords) || o.tags || [],
      url: o.url
    });
  });

  guides.forEach(g => {
    index.push({
      type: 'guide',
      title: g.title,
      slug: g.slug,
      category: g.category,
      description: g.description,
      keywords: (g.seo && g.seo.keywords) || g.tags || [],
      url: g.url
    });
  });

  brands.forEach(b => {
    index.push({
      type: 'brand',
      title: b.name,
      slug: b.slug,
      category: 'Brand',
      description: b.description,
      keywords: [],
      url: b.url
    });
  });

  countries.forEach(c => {
    index.push({
      type: 'country',
      title: c.name,
      slug: c.slug,
      category: 'Country',
      description: c.seo.description,
      keywords: [c.name.toLowerCase(), c.code.toLowerCase()],
      url: c.url
    });
  });

  writeJSON('search-index.json', index);
}

/* =============================================
   MAIN
   ============================================= */

function main() {
  console.log('\n========================================');
  console.log('  TryTreat Static Site Generator');
  console.log('========================================\n');

  console.log(`[1/8] Generating category hub...`);
  generateCategoryHub();

  console.log(`[2/8] Generating ${categories.length} category pages...`);
  generateCategoryPages();

  console.log(`[3/8] Generating offer hub + ${offers.length} offer pages...`);
  generateOfferHub();
  generateOfferPages();

  console.log(`[4/8] Generating guide hub + ${guides.length} guide pages...`);
  generateGuideHub();
  generateGuidePages();

  console.log(`[5/8] Generating brand hub + ${brands.length} brand pages...`);
  generateBrandHub();
  generateBrandPages();

  console.log(`[6/8] Generating country hub + ${countries.length} country pages...`);
  generateCountryHub();
  generateCountryPages();

  console.log(`[7/8] Generating sitemap, robots, search index...`);
  generateSitemap();
  generateRobots();
  generateSearchIndex();

  console.log(`[8/8] Done!\n`);

  const totalPages =
    1 + /* category hub */
    categories.length +
    1 + /* offer hub */
    offers.length +
    1 + /* guide hub */
    guides.length +
    1 + /* brand hub */
    brands.length +
    1 + /* country hub */
    countries.length;

  console.log(`Total pages generated: ${totalPages}`);
  const guideCount = guides.length;
  const faqCount = loadJSON('faq.json').length;
  const compCount = loadJSON('comparisons.json').length;
  const egCount = loadJSON('evergreen.json').length;
  console.log(`Data: ${categories.length} categories, ${offers.length} offers, ${guideCount} guides (${guides.filter(g=>g.categorySlug==='free-samples'||g.categorySlug==='product-testing').length} SEO guides, ${faqCount} FAQ, ${compCount} comparisons, ${egCount} evergreen), ${brands.length} brands, ${countries.length} countries`);
  console.log('\nDone. Site is ready to deploy.\n');
}

main();
