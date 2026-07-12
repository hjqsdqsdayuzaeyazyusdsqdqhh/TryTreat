/* =============================================
   TryTreat - Phase 2: Template JavaScript
   Data Loading, Rendering, Search
   ============================================= */

var TT = TT || {};

/* ---------- Config ---------- */
TT.BASE_URL = '';
TT.DATA_PATH = '/data/';

/* ---------- Data Cache ---------- */
TT.cache = {};

/* ---------- Fetch JSON Data ---------- */
TT.fetchData = function (filename) {
  if (TT.cache[filename]) {
    return Promise.resolve(TT.cache[filename]);
  }
  return fetch(TT.DATA_PATH + filename + '.json')
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to load ' + filename);
      return res.json();
    })
    .then(function (data) {
      TT.cache[filename] = data;
      return data;
    });
};

/* ---------- URL Helpers ---------- */
TT.getRelativePath = function (absoluteUrl) {
  return absoluteUrl;
};

TT.getCategoryBySlug = function (slug) {
  return TT.fetchData('categories').then(function (categories) {
    return categories.find(function (c) { return c.slug === slug; });
  });
};

TT.getOffersByCategory = function (categorySlug) {
  return TT.fetchData('offers').then(function (offers) {
    return offers.filter(function (o) { return o.category === categorySlug; });
  });
};

TT.getGuideBySlug = function (slug) {
  return TT.fetchData('guides').then(function (guides) {
    return guides.find(function (g) { return g.slug === slug; });
  });
};

TT.getRelatedGuides = function (guideId) {
  return TT.fetchData('guides').then(function (guides) {
    return guides.filter(function (g) { return g.id !== guideId; }).slice(0, 3);
  });
};

TT.getRelatedOffers = function (offerIds) {
  return TT.fetchData('offers').then(function (offers) {
    if (!offerIds || !offerIds.length) return [];
    return offers.filter(function (o) { return offerIds.indexOf(o.id) !== -1; });
  });
};

TT.searchAll = function (query) {
  if (!query || query.length < 2) return Promise.resolve([]);
  var q = query.toLowerCase();
  return Promise.all([
    TT.fetchData('offers'),
    TT.fetchData('guides'),
    TT.fetchData('categories')
  ]).then(function (results) {
    var offers = results[0];
    var guides = results[1];
    var categories = results[2];
    var matched = [];

    categories.forEach(function (item) {
      if (item.name.toLowerCase().indexOf(q) !== -1 ||
          item.description.toLowerCase().indexOf(q) !== -1) {
        matched.push({
          type: 'category',
          title: item.name,
          desc: item.description,
          url: item.url
        });
      }
    });

    offers.forEach(function (item) {
      if (item.title.toLowerCase().indexOf(q) !== -1 ||
          item.description.toLowerCase().indexOf(q) !== -1 ||
          item.brand.toLowerCase().indexOf(q) !== -1) {
        matched.push({
          type: 'offer',
          title: item.title,
          desc: item.description,
          url: item.url
        });
      }
    });

    guides.forEach(function (item) {
      if (item.title.toLowerCase().indexOf(q) !== -1 ||
          item.description.toLowerCase().indexOf(q) !== -1) {
        matched.push({
          type: 'guide',
          title: item.title,
          desc: item.description,
          url: item.url
        });
      }
    });

    return matched;
  });
};

/* ---------- Render: Offer Card ---------- */
TT.renderOfferCard = function (offer) {
  var badgeClass = 'offer-card__badge';
  var tagClass = 'offer-card__tag';
  if (offer.type === 'coupon') {
    badgeClass += ' offer-card__badge--coupon';
    tagClass += ' offer-card__tag--coupon';
  } else if (offer.type === 'giveaway') {
    badgeClass += ' offer-card__badge--giveaway';
    tagClass += ' offer-card__tag--giveaway';
  }

  var badgeLabel = offer.type === 'free-sample' ? 'Free Sample' :
                   offer.type === 'coupon' ? 'Coupon' :
                   offer.type === 'giveaway' ? 'Giveaway' : offer.type;

  var tagLabel = offer.value || 'Free';

  return '<a href="' + offer.url + '" class="offer-card-link">' +
    '<article class="offer-card">' +
      '<div class="' + badgeClass + '">' + badgeLabel + '</div>' +
      '<div class="offer-card__image" aria-hidden="true">' +
        '<div class="offer-card__image-placeholder">' +
          '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">' +
            '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>' +
            '<circle cx="8.5" cy="8.5" r="1.5"/>' +
            '<polyline points="21 15 16 10 5 21"/>' +
          '</svg>' +
        '</div>' +
      '</div>' +
      '<div class="offer-card__body">' +
        '<span class="offer-card__brand">' + offer.brand + '</span>' +
        '<h3 class="offer-card__title">' + offer.title + '</h3>' +
        '<p class="offer-card__desc">' + offer.description + '</p>' +
        '<div class="offer-card__meta">' +
          '<span class="' + tagClass + '">' + tagLabel + '</span>' +
          '<span class="offer-card__date">' + (offer.expiresAt || '') + '</span>' +
        '</div>' +
      '</div>' +
    '</article>' +
  '</a>';
};

/* ---------- Render: Guide Card ---------- */
TT.renderGuideCard = function (guide) {
  return '<a href="' + guide.url + '" class="guide-card-link">' +
    '<article class="guide-card">' +
      '<div class="guide-card__image" aria-hidden="true">' +
        '<div class="guide-card__image-placeholder">' +
          '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>' +
            '<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>' +
          '</svg>' +
        '</div>' +
      '</div>' +
      '<div class="guide-card__body">' +
        '<span class="guide-card__category">' + guide.category + '</span>' +
        '<h3 class="guide-card__title">' + guide.title + '</h3>' +
        '<p class="guide-card__desc">' + guide.description + '</p>' +
        '<div class="guide-card__meta">' +
          '<span class="guide-card__read-time">' + guide.readTime + '</span>' +
        '</div>' +
      '</div>' +
    '</article>' +
  '</a>';
};

/* ---------- Render: Category Card ---------- */
TT.renderCategoryCard = function (category) {
  var iconSvgs = {
    'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    'gift': '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
    'scissors': '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    'dollar': '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
  };

  var svgContent = iconSvgs[category.icon] || iconSvgs['heart'];

  return '<a href="' + category.url + '" class="category-card-link">' +
    '<div class="category-card">' +
      '<div class="category-card__icon" aria-hidden="true">' +
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
          svgContent +
        '</svg>' +
      '</div>' +
      '<h3 class="category-card__title">' + category.name + '</h3>' +
      '<p class="category-card__desc">' + category.shortName + '</p>' +
    '</div>' +
  '</a>';
};

/* ---------- Render: Search Result ---------- */
TT.renderSearchResult = function (result) {
  var typeLabel = result.type === 'category' ? 'Category' :
                  result.type === 'offer' ? 'Offer' : 'Guide';
  var tagClass = result.type === 'category' ? 'offer-card__tag' :
                 result.type === 'offer' ? 'offer-card__tag offer-card__tag--coupon' :
                 'offer-card__tag offer-card__tag--giveaway';

  return '<a href="' + result.url + '" class="offer-card-link">' +
    '<article class="offer-card">' +
      '<div class="offer-card__body">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">' +
          '<span class="offer-card__brand">' + typeLabel + '</span>' +
          '<span class="' + tagClass + '">' + typeLabel + '</span>' +
        '</div>' +
        '<h3 class="offer-card__title">' + result.title + '</h3>' +
        '<p class="offer-card__desc">' + result.desc + '</p>' +
      '</div>' +
    '</article>' +
  '</a>';
};

/* ---------- Render: Breadcrumb ---------- */
TT.renderBreadcrumb = function (items) {
  var html = '<nav class="breadcrumb" aria-label="Breadcrumb"><ol class="breadcrumb__list">';
  items.forEach(function (item, i) {
    if (i > 0) {
      html += '<li class="breadcrumb__separator" aria-hidden="true">/</li>';
    }
    if (i === items.length - 1) {
      html += '<li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page">' + item.label + '</span></li>';
    } else {
      html += '<li class="breadcrumb__item"><a href="' + item.url + '">' + item.label + '</a></li>';
    }
  });
  html += '</ol></nav>';
  return html;
};

/* ---------- Render: FAQ ---------- */
TT.renderFAQ = function (faqItems, idPrefix) {
  if (!faqItems || !faqItems.length) return '';
  var html = '<div class="faq__list" role="list">';
  faqItems.forEach(function (item, i) {
    var uid = idPrefix + '-faq-' + i;
    html += '<div class="faq__item" role="listitem">' +
      '<button class="faq__question" aria-expanded="false" aria-controls="' + uid + '-answer">' +
        '<span>' + item.question + '</span>' +
        '<svg class="faq__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<polyline points="6 9 12 15 18 9"/>' +
        '</svg>' +
      '</button>' +
      '<div class="faq__answer" id="' + uid + '-answer" role="region" aria-hidden="true">' +
        '<p>' + item.answer + '</p>' +
      '</div>' +
    '</div>';
  });
  html += '</div>';
  return html;
};

/* ---------- Inject Page Structure ---------- */
TT.injectHeader = function (activePage) {
  var headerHtml = document.getElementById('tt-header-template');
  var footerHtml = document.getElementById('tt-footer-template');
  if (!headerHtml || !footerHtml) return;

  document.body.insertAdjacentHTML('afterbegin', headerHtml.innerHTML);
  document.body.insertAdjacentHTML('beforeend', footerHtml.innerHTML);

  if (typeof initMobileMenu === 'function') initMobileMenu();
  if (typeof initSearchModal === 'function') initSearchModal();
  if (typeof initDarkMode === 'function') initDarkMode();
  if (typeof initFAQ === 'function') initFAQ();
};

/* ---------- SEO: Inject JSON-LD ---------- */
TT.injectJsonLd = function (data) {
  if (!data) return;
  var script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

/* ---------- Init Search Page ---------- */
TT.initSearchPage = function () {
  var input = document.getElementById('search-page-input');
  var resultsGrid = document.getElementById('search-results-grid');
  var resultsInfo = document.getElementById('search-results-info');
  var emptyState = document.getElementById('search-empty');
  if (!input) return;

  var debounceTimer;

  function doSearch() {
    var query = input.value.trim();
    if (query.length < 2) {
      resultsGrid.innerHTML = '';
      resultsInfo.textContent = '';
      emptyState.style.display = 'block';
      emptyState.querySelector('.search-page__empty-title').textContent = 'Search TryTreat';
      emptyState.querySelector('.search-page__empty-desc').textContent = 'Type at least 2 characters to search.';
      return;
    }

    TT.searchAll(query).then(function (results) {
      if (results.length === 0) {
        resultsGrid.innerHTML = '';
        resultsInfo.textContent = '';
        emptyState.style.display = 'block';
        emptyState.querySelector('.search-page__empty-title').textContent = 'No results found';
        emptyState.querySelector('.search-page__empty-desc').textContent = 'Try a different search term.';
      } else {
        emptyState.style.display = 'none';
        resultsInfo.textContent = results.length + ' result' + (results.length !== 1 ? 's' : '') + ' found for "' + query + '"';
        resultsGrid.innerHTML = results.map(TT.renderSearchResult).join('');
      }
    });
  }

  input.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(doSearch, 300);
  });

  var urlParams = new URLSearchParams(window.location.search);
  var q = urlParams.get('q');
  if (q) {
    input.value = q;
    doSearch();
  }
};

/* ---------- Init: FAQ on New Pages ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var faqBtns = document.querySelectorAll('.faq__question');
  faqBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq__item');
      var answer = item.querySelector('.faq__answer');
      var isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', !isOpen);
      answer.setAttribute('aria-hidden', isOpen);
    });
  });
});
