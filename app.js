/* ==========================================================================
   3EM PROJE VE DANIŞMANLIK — Modern V2 Application & Live Admin CMS
   - Smooth Carousels, Tabs, Accordions, Lightbox, Scroll Reveal & Counters
   - CTRL + SHIFT + ALT + E: Live In-Place & Sidebar Text Editor (CMS)
   ========================================================================== */

(function () {
  'use strict';

  const PAGE_KEY = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const STORAGE_KEY = '3emv2_cms_edits_v1';

  /* ------------------------------------------------------------------------
     1. STICKY HEADER & MOBILE OFF-CANVAS MENU
     ------------------------------------------------------------------------ */
  const header = document.querySelector('.site-header');
  const backToTop = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 30);
    if (backToTop) backToTop.classList.toggle('visible', y > 360);
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const menuToggle = document.querySelector('.menu-toggle');
  const offcanvasDrawer = document.querySelector('.offcanvas-drawer');
  const offcanvasBackdrop = document.querySelector('.offcanvas-backdrop');
  const offcanvasClose = document.querySelector('.offcanvas-close');

  function setDrawer(open) {
    if (!offcanvasDrawer || !offcanvasBackdrop) return;
    offcanvasDrawer.classList.toggle('open', open);
    offcanvasBackdrop.classList.toggle('open', open);
  }

  if (menuToggle) menuToggle.addEventListener('click', () => setDrawer(true));
  if (offcanvasClose) offcanvasClose.addEventListener('click', () => setDrawer(false));
  if (offcanvasBackdrop) offcanvasBackdrop.addEventListener('click', () => setDrawer(false));

  /* ------------------------------------------------------------------------
     2. SCROLL REVEAL ANIMATIONS & ANIMATED COUNTERS
     ------------------------------------------------------------------------ */
  const animatedEls = document.querySelectorAll('[data-animate]');
  if ('IntersectionObserver' in window && animatedEls.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-delay');
          if (delay) entry.target.style.transitionDelay = delay + 'ms';
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    animatedEls.forEach((el) => observer.observe(el));
  } else {
    animatedEls.forEach((el) => el.classList.add('in-view'));
  }

  // Animated Counters (e.g. 40+, 10k)
  const counters = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window && counters.length > 0) {
    const counterObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        obs.unobserve(el);
        const targetVal = parseInt(el.getAttribute('data-counter'), 10) || 40;
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1800;
        const start = performance.now();
        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * targetVal) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => counterObs.observe(c));
  }

  /* ------------------------------------------------------------------------
     3. CAROUSELS (Hero Thumbnail Gallery & Feature Slider)
     ------------------------------------------------------------------------ */
  let heroGalleryCarousel = null;

  function initCarousel(rootSelector, slideSelector, indicatorSelector, intervalMs) {
    const root = document.querySelector(rootSelector);
    if (!root) return null;
    let slides = Array.from(root.querySelectorAll(slideSelector));
    let indicators = Array.from(root.querySelectorAll(indicatorSelector));
    const prevBtn = root.querySelector('.prev');
    const nextBtn = root.querySelector('.next');
    if (slides.length === 0) return null;

    let current = 0;
    let timer = null;

    function refreshNodes() {
      slides = Array.from(root.querySelectorAll(slideSelector));
      indicators = Array.from(root.querySelectorAll(indicatorSelector));
      goTo(current >= slides.length ? 0 : current);
    }

    function goTo(index) {
      if (slides.length === 0) return;
      current = (index + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === current));
      indicators.forEach((ind, i) => ind.classList.toggle('active', i === current));
    }

    function startAuto() {
      stopAuto();
      if (intervalMs) {
        timer = setInterval(() => {
          if (!document.body.classList.contains('cms-edit-active')) {
            goTo(current + 1);
          }
        }, intervalMs);
      }
    }

    function stopAuto() {
      if (timer) clearInterval(timer);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });
    
    function bindIndicators() {
      indicators.forEach((ind, idx) => {
        ind.onclick = () => { goTo(idx); startAuto(); };
      });
    }
    bindIndicators();

    root.addEventListener('mouseenter', stopAuto);
    root.addEventListener('mouseleave', startAuto);
    startAuto();

    return { goTo, refreshNodes, bindIndicators, getCurrent: () => current };
  }

  heroGalleryCarousel = initCarousel('#hero-gallery', '.hero-slide', '.hero-thumb', 3800);
  initCarousel('#feature-slider', '.feature-slide', '.slider-dot', 5200);

  /* ------------------------------------------------------------------------
     4. INTERACTIVE TABS (Hakkımızda) & ACCORDIONS (Duyurular)
     ------------------------------------------------------------------------ */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      tabBtns.forEach((b) => b.classList.toggle('active', b === btn));
      tabPanels.forEach((p) => p.classList.toggle('active', p.id === targetId));
    });
  });

  const accTriggers = document.querySelectorAll('.accordion-trigger');
  accTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.accordion-item').forEach((it) => it.classList.remove('active'));
      if (!isOpen) item.classList.add('active');
    });
  });

  /* ------------------------------------------------------------------------
     5. LIGHTBOX FOR GALLERY & PROJECT IMAGES
     ------------------------------------------------------------------------ */
  const lightboxImages = document.querySelectorAll('.hero-slide img, .bento-left-card img, .bento-card img, .ref-dev-card img, .srv-six-card img, .prj-strip-item img, .prj-nine-card img');
  if (lightboxImages.length > 0) {
    const modal = document.createElement('div');
    modal.className = 'lightbox-modal';
    modal.innerHTML = '<button class="lightbox-close" aria-label="Kapat">&times;</button><img src="" alt="Önizleme">';
    document.body.appendChild(modal);

    const modalImg = modal.querySelector('img');
    const closeBtn = modal.querySelector('.lightbox-close');

    lightboxImages.forEach((img) => {
      img.addEventListener('click', () => {
        if (document.body.classList.contains('cms-edit-active')) return;
        modalImg.src = img.src;
        modal.classList.add('open');
      });
    });

    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modal.classList.remove('open');
    });
  }

  /* ------------------------------------------------------------------------
     6. CONTACT FORM HANDLER (FormSubmit.co API Integration)
     ------------------------------------------------------------------------ */
  const DEFAULT_CONTACT_EMAIL = 'semtasoft@gmail.com';

  function getContactTargetEmail() {
    const allEdits = loadAllEdits();
    if (allEdits.contactEmail && typeof allEdits.contactEmail === 'string') {
      return allEdits.contactEmail.trim();
    }
    const form = document.querySelector('#contact-form');
    if (form) {
      const act = form.getAttribute('action') || '';
      const match = act.match(/formsubmit\.co\/([^\s\/?#]+)/i);
      if (match && match[1]) return match[1];
    }
    return DEFAULT_CONTACT_EMAIL;
  }

  function setContactTargetEmail(email) {
    const allEdits = loadAllEdits();
    allEdits.contactEmail = email;
    saveAllEdits(allEdits);

    const form = document.querySelector('#contact-form');
    if (form) {
      form.setAttribute('action', 'https://formsubmit.co/' + email);
    }
  }

  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('#contact-submit-btn') || contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : 'Gönder';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Gönderiliyor...';
      }

      const targetEmail = getContactTargetEmail();

      try {
        const formData = new FormData(contactForm);
        const response = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(targetEmail), {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: formData
        });

        if (response.ok) {
          showToast('✅ Mesajınız başarıyla iletildi! (' + targetEmail + ')');
          contactForm.reset();
        } else {
          showToast('Mesajınız gönderildi. En kısa sürede iletişime geçeceğiz.');
          contactForm.reset();
        }
      } catch (err) {
        // Fallback: normal form submit if fetch fails (e.g. offline)
        try {
          contactForm.submit();
        } catch (_) {
          showToast('Mesajınız alındı!');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }

  /* ------------------------------------------------------------------------
     7. ADMIN PANEL & LIVE CONTENT/IMAGE CMS (CTRL + SHIFT + ALT + E)
     ------------------------------------------------------------------------ */
  const EDITABLE_SELECTOR = [
    '.site-header .nav-link',
    '.offcanvas-nav a',
    'main h1', 'main h2', 'main h3', 'main h4', 'main h5', 'main h6',
    'main p', 'main blockquote', 'main li',
    'main a.btn', 'main a.link-underline',
    'main .num-badge', 'main .counter-num', 'main .news-meta',
    'main .accordion-trigger span', 'main .tab-btn',
    '.footer-nav a'
  ].join(', ');

  let cmsActive = false;
  let activeTab = 'texts'; // 'texts' | 'images'
  let editableElements = [];
  let originalTexts = {};
  let editableImages = [];
  let originalImages = {};

  function normalizePageKey(key) {
    if (!key) return 'index.html';
    let s = String(key);
    try {
      s = decodeURIComponent(s);
    } catch (_) {}
    s = s.toLowerCase().trim();
    if (s.endsWith('.html') || s.endsWith('.htm')) {
      s = s.replace(/\.html?$/i, '');
    }
    if (s === 'anasayfa' || s === 'index' || s === '') {
      return 'index';
    }
    // Normalize Turkish characters for robust matching (e.g. İ/i, ı/i)
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function getPageEdits(allEdits, pageKey) {
    if (!allEdits || typeof allEdits !== 'object') return {};
    if (allEdits[pageKey]) return allEdits[pageKey];

    const targetNorm = normalizePageKey(pageKey);
    for (const k of Object.keys(allEdits)) {
      if (normalizePageKey(k) === targetNorm) {
        return allEdits[k];
      }
    }
    return {};
  }

  function getPageKeyForStorage(allEdits, pageKey) {
    const targetNorm = normalizePageKey(pageKey);
    for (const k of Object.keys(allEdits)) {
      if (normalizePageKey(k) === targetNorm) {
        return k;
      }
    }
    return pageKey;
  }

  function loadAllEdits() {
    let local = {};
    try {
      local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (_) {
      local = {};
    }
    const remote = (window._SITE_DATA_ && typeof window._SITE_DATA_ === 'object') ? window._SITE_DATA_ : {};

    // Deep merge page-by-page so local never wipes out remote page keys
    const merged = {};
    const allKeys = new Set([...Object.keys(remote), ...Object.keys(local)]);
    allKeys.forEach((k) => {
      if (
        remote[k] && typeof remote[k] === 'object' && !Array.isArray(remote[k]) &&
        local[k] && typeof local[k] === 'object' && !Array.isArray(local[k])
      ) {
        merged[k] = Object.assign({}, remote[k], local[k]);
      } else if (local[k] !== undefined) {
        merged[k] = local[k];
      } else {
        merged[k] = remote[k];
      }
    });
    return merged;
  }

  function saveAllEdits(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  async function syncServerSiteData() {
    try {
      const isBlog = window.location.pathname.includes('/blog/');
      const url = isBlog ? '../site-data.json' : 'site-data.json';
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json && typeof json === 'object') {
          window._SITE_DATA_ = Object.assign({}, window._SITE_DATA_ || {}, json);
          indexEditableElements();
          if (typeof renderDrawer === 'function') renderDrawer();
        }
      }
    } catch (_) {}
  }

  function getCanonicalPageKey() {
    let p = 'index.html';
    try {
      const raw = window.location.pathname.split('/').pop() || 'index.html';
      p = decodeURIComponent(raw).toLowerCase();
    } catch (_) {
      p = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    }
    if (p === 'anasayfa.html' || p === '' || p === 'index.htm') return 'index.html';
    return p;
  }

  function extractBgUrl(styleStr) {
    if (!styleStr) return '';
    const match = /url\(['"]?(.*?)['"]?\)/i.exec(styleStr);
    return match ? match[1] : '';
  }

  let originalHeroOrder = null;

  function saveHeroSliderOrder() {
    const gallery = document.querySelector('#hero-gallery');
    if (!gallery) return;
    const slides = Array.from(gallery.querySelectorAll('.hero-slides .hero-slide img')).map((img) => img.getAttribute('src'));
    const canonicalPage = getCanonicalPageKey();
    const allEdits = loadAllEdits();
    const storageKey = getPageKeyForStorage(allEdits, canonicalPage);
    if (!allEdits[storageKey]) allEdits[storageKey] = {};
    allEdits[storageKey]._heroOrder = slides;
    saveAllEdits(allEdits);
  }

  function restoreHeroSliderOrder() {
    const gallery = document.querySelector('#hero-gallery');
    if (!gallery) return;
    const slidesContainer = gallery.querySelector('.hero-slides');
    const thumbsContainer = gallery.querySelector('.hero-thumbnails');
    if (!slidesContainer || !thumbsContainer) return;

    if (!originalHeroOrder) {
      originalHeroOrder = Array.from(slidesContainer.querySelectorAll('.hero-slide img')).map((img) => img.getAttribute('src'));
    }

    const canonicalPage = getCanonicalPageKey();
    const allEdits = loadAllEdits();
    const pageEdits = getPageEdits(allEdits, canonicalPage);
    const savedOrder = pageEdits._heroOrder;
    if (!savedOrder || !Array.isArray(savedOrder) || savedOrder.length === 0) return;

    const currentSlides = Array.from(slidesContainer.querySelectorAll('.hero-slide'));
    const currentThumbs = Array.from(thumbsContainer.querySelectorAll('.hero-thumb'));

    savedOrder.forEach((src) => {
      const s = currentSlides.find((el) => el.querySelector('img')?.getAttribute('src') === src);
      const t = currentThumbs.find((el) => el.querySelector('img')?.getAttribute('src') === src);
      if (s) slidesContainer.appendChild(s);
      if (t) thumbsContainer.appendChild(t);
    });

    if (heroGalleryCarousel) {
      heroGalleryCarousel.refreshNodes();
      heroGalleryCarousel.bindIndicators();
    }
  }

  function ensureFooterLinks() {
    const copy = document.querySelector('.footer-copy');
    if (copy) {
      if (!copy.querySelector('a[href*="semtasoft"]') || !copy.querySelector('a[href^="tel:"]')) {
        copy.innerHTML = `Copyright © 2024 <a href="https://3emproje.com">3emproje.com</a><br>
Tüm Hakkı Saklıdır. Designed By <a href="https://semtasoft.com" target="_blank" rel="noopener">Semtasoft®</a><br>
Telefon: <a href="tel:+902129510647">+ 90 212 951 06 47</a> - <a href="tel:+902129510648">48</a>`;
      }
    }
  }

  function indexEditableElements() {
    restoreHeroSliderOrder();
    ensureFooterLinks();
    const canonicalPage = getCanonicalPageKey();
    const allEdits = loadAllEdits();
    const pageEdits = getPageEdits(allEdits, canonicalPage);

    const activeContactEmail = getContactTargetEmail();
    const contactFormEl = document.querySelector('#contact-form');
    if (contactFormEl) {
      contactFormEl.setAttribute('action', 'https://formsubmit.co/' + activeContactEmail);
    }

    // 1. Text elements
    const textNodes = Array.from(document.querySelectorAll(EDITABLE_SELECTOR));
    editableElements = [];
    textNodes.forEach((el, idx) => {
      if (el.closest('.cms-drawer, .cms-admin-bar, .cms-modal-backdrop')) return;
      const id = el.getAttribute('data-cms-id') || ('txt_' + idx);
      el.setAttribute('data-cms-id', id);
      if (!(id in originalTexts)) {
        originalTexts[id] = el.innerHTML;
      }
      if (pageEdits[id] !== undefined) {
        el.innerHTML = pageEdits[id];
      }
      editableElements.push(el);
    });

    // 2. Image elements (<img> tags & elements with background-image)
    editableImages = [];
    let imgIdx = 0;

    // Regular <img> elements
    document.querySelectorAll('img').forEach((el) => {
      if (el.closest('.cms-drawer, .cms-admin-bar, .cms-modal-backdrop')) return;
      const id = el.getAttribute('data-cms-img-id') || ('img_' + imgIdx++);
      el.setAttribute('data-cms-img-id', id);
      const originalSrc = el.getAttribute('src') || '';
      if (!(id in originalImages)) {
        originalImages[id] = originalSrc;
      }
      if (pageEdits[id] !== undefined) {
        el.setAttribute('src', pageEdits[id]);
      }
      editableImages.push({
        id,
        el,
        type: 'img',
        src: () => el.getAttribute('src') || '',
        setSrc: (val) => el.setAttribute('src', val),
        alt: el.getAttribute('alt') || el.closest('a')?.getAttribute('title') || 'Resim #' + imgIdx
      });
    });

    // Elements with inline background-image
    document.querySelectorAll('[style*="background-image"], [style*="background:url"], [style*="background: url"]').forEach((el) => {
      if (el.closest('.cms-drawer, .cms-admin-bar, .cms-modal-backdrop')) return;
      const id = el.getAttribute('data-cms-img-id') || ('img_bg_' + imgIdx++);
      el.setAttribute('data-cms-img-id', id);
      const originalBg = extractBgUrl(el.style.backgroundImage || el.style.background);
      if (!(id in originalImages)) {
        originalImages[id] = originalBg;
      }
      if (pageEdits[id] !== undefined) {
        el.style.backgroundImage = `url('${pageEdits[id]}')`;
      }
      editableImages.push({
        id,
        el,
        type: 'bg',
        src: () => extractBgUrl(el.style.backgroundImage || el.style.background),
        setSrc: (val) => { el.style.backgroundImage = `url('${val}')`; },
        alt: el.className ? (el.className.split(' ')[0] + ' Arka Plan') : ('Arka Plan #' + imgIdx)
      });
    });
  }

  function updateElementText(id, newHtml, fromInline) {
    const canonicalPage = getCanonicalPageKey();
    const allEdits = loadAllEdits();
    const storageKey = getPageKeyForStorage(allEdits, canonicalPage);
    if (!allEdits[storageKey]) allEdits[storageKey] = {};
    allEdits[storageKey][id] = newHtml;
    saveAllEdits(allEdits);

    const targetEl = document.querySelector(`[data-cms-id="${id}"]`);
    if (targetEl && !fromInline) {
      targetEl.innerHTML = newHtml;
    }
    if (fromInline) {
      const sideInput = document.querySelector(`.cms-field-input[data-target-id="${id}"]`);
      if (sideInput && document.activeElement !== sideInput) {
        sideInput.value = targetEl ? targetEl.innerText.trim() : newHtml;
      }
    }
  }

  function updateElementImage(id, newSrc) {
    const canonicalPage = getCanonicalPageKey();
    const allEdits = loadAllEdits();
    const storageKey = getPageKeyForStorage(allEdits, canonicalPage);
    if (!allEdits[storageKey]) allEdits[storageKey] = {};
    allEdits[storageKey][id] = newSrc;
    saveAllEdits(allEdits);

    const item = editableImages.find((img) => img.id === id);
    if (item) {
      item.setSrc(newSrc);
    }
    renderDrawer();
    showToast('Resim güncellendi!');
  }

  // Toast helper
  let toastEl = null;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'cms-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => toastEl.classList.remove('show'), 2800);
  }

  // Quick Image Modal for direct clicking
  let imgModalBackdrop = null;
  function openImageModal(imgItem) {
    if (!imgModalBackdrop) {
      imgModalBackdrop = document.createElement('div');
      imgModalBackdrop.className = 'cms-modal-backdrop';
      document.body.appendChild(imgModalBackdrop);
    }

    const currentSrc = imgItem.src();
    const originalSrc = originalImages[imgItem.id] || currentSrc;

    imgModalBackdrop.innerHTML = `
      <div class="cms-modal">
        <div class="cms-modal-header">
          <h4>🖼️ Resmi Değiştir (${imgItem.type === 'bg' ? 'Arka Plan' : 'Görsel'})</h4>
          <button type="button" class="cms-modal-close" id="cms-modal-close-btn">&times;</button>
        </div>
        <div class="cms-modal-body">
          <img class="cms-modal-preview" id="cms-modal-preview-img" src="${currentSrc}" alt="Önizleme">
          <div class="cms-modal-options">
            <label class="cms-modal-btn-upload">
              📁 Bilgisayarımdan Yeni Resim Seç
              <input type="file" id="cms-modal-file-input" accept="image/*" style="display:none">
            </label>
            <div style="font-size:0.75rem;color:#94a3b8;text-align:center;">veya dosya yolu / URL girin:</div>
            <div class="cms-modal-url-row">
              <input type="text" class="cms-modal-input" id="cms-modal-url-input" value="${currentSrc}" placeholder="images/ornek.jpg veya https://...">
              <button type="button" class="cms-btn primary" id="cms-modal-apply-url-btn" style="flex:0;padding:8px 16px;">Uygula</button>
            </div>
            <button type="button" class="cms-btn" id="cms-modal-reset-btn" style="margin-top:6px;">↺ Varsayılan Resme Dön</button>
          </div>
        </div>
      </div>
    `;

    imgModalBackdrop.style.display = 'flex';

    const close = () => { imgModalBackdrop.style.display = 'none'; };
    document.getElementById('cms-modal-close-btn').addEventListener('click', close);
    imgModalBackdrop.addEventListener('click', (e) => {
      if (e.target === imgModalBackdrop) close();
    });

    const fileInput = document.getElementById('cms-modal-file-input');
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        document.getElementById('cms-modal-preview-img').src = dataUrl;
        updateElementImage(imgItem.id, dataUrl);
        close();
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('cms-modal-apply-url-btn').addEventListener('click', () => {
      const val = document.getElementById('cms-modal-url-input').value.trim();
      if (!val) return;
      updateElementImage(imgItem.id, val);
      close();
    });

    document.getElementById('cms-modal-reset-btn').addEventListener('click', () => {
      updateElementImage(imgItem.id, originalSrc);
      close();
      showToast('Orijinal resme döndürüldü.');
    });
  }

  // Build Admin UI
  let adminBar = null;
  let adminDrawer = null;

  function buildAdminUI() {
    if (adminDrawer) return;

    adminBar = document.createElement('div');
    adminBar.className = 'cms-admin-bar';
    adminBar.innerHTML = `
      <span class="cms-status-dot"></span>
      <span><strong>Admin Modu Aktif</strong> (Yazılara tıklayıp yazın, resimlere tıklayıp değiştirin)</span>
      <button type="button" class="cms-btn primary" id="cms-open-drawer-btn">Paneli Aç</button>
      <button type="button" class="cms-btn" id="cms-exit-btn">Kapat</button>
    `;
    document.body.appendChild(adminBar);

    const hasHeroSlider = !!document.querySelector('#hero-gallery');

    adminDrawer = document.createElement('aside');
    adminDrawer.className = 'cms-drawer';
    adminDrawer.innerHTML = `
      <div class="cms-drawer-header">
        <h3>⚡ 3EM Admin — İçerik & Resim Yönetimi</h3>
        <button type="button" class="cms-btn" id="cms-minimize-btn" style="flex:0;padding:6px 10px;">Gizle</button>
      </div>
      <div class="cms-tab-nav">
        <button type="button" class="active" id="cms-tab-texts-btn">✍️ Yazılar (<span id="cms-count-texts">0</span>)</button>
        <button type="button" id="cms-tab-images-btn">🖼️ Resimler (<span id="cms-count-images">0</span>)</button>
        ${hasHeroSlider ? '<button type="button" id="cms-tab-slider-btn">🎠 Slider Sırala (<span id="cms-count-slides">0</span>)</button>' : ''}
      </div>
      <div class="cms-toolbar">
        <div class="cms-contact-email-box">
          <label>📧 İletişim Formunun Gönderileceği E-posta:</label>
          <div style="display:flex;gap:6px;">
            <input type="email" id="cms-contact-email-input" class="cms-search" style="padding:7px 10px;font-size:0.84rem;" value="${getContactTargetEmail()}" placeholder="semtasoft@gmail.com">
            <button type="button" class="cms-btn primary" id="cms-contact-email-save-btn" style="flex:0;white-space:nowrap;padding:6px 12px;">Güncelle</button>
          </div>
        </div>
        <input type="search" class="cms-search" id="cms-search-input" placeholder="Sayfada ara...">
        <div class="cms-btn-row">
          <button type="button" class="cms-btn primary" id="cms-save-html-btn" title="Değişiklikleri HTML dosyası olarak indir veya kaydet">💾 HTML Kaydet</button>
          <button type="button" class="cms-btn" id="cms-export-json-btn" title="Tüm site yazı ve resimlerini JSON olarak yedekle">📤 JSON İndir</button>
          <button type="button" class="cms-btn" id="cms-import-json-btn" title="JSON yedeğini geri yükle">📥 JSON Yükle</button>
          <button type="button" class="cms-btn danger" id="cms-reset-page-btn" title="Bu sayfadaki tüm değişiklikleri ilk haline döndür">↺ Sıfırla</button>
        </div>
        <input type="file" id="cms-json-file" accept=".json" style="display:none">
        <input type="file" id="cms-drawer-file-picker" accept="image/*" style="display:none">
      </div>
      <div class="cms-fields-list" id="cms-fields-list"></div>
    `;
    document.body.appendChild(adminDrawer);

    document.getElementById('cms-open-drawer-btn').addEventListener('click', () => {
      adminDrawer.classList.add('open');
      const emailInput = document.getElementById('cms-contact-email-input');
      if (emailInput) emailInput.value = getContactTargetEmail();
    });
    document.getElementById('cms-minimize-btn').addEventListener('click', () => {
      adminDrawer.classList.remove('open');
    });
    document.getElementById('cms-exit-btn').addEventListener('click', () => {
      toggleAdminMode(false);
    });

    document.getElementById('cms-contact-email-save-btn').addEventListener('click', () => {
      const emailInput = document.getElementById('cms-contact-email-input');
      const val = (emailInput?.value || '').trim();
      if (!val || !val.includes('@')) {
        alert('Lütfen geçerli bir e-posta adresi girin.');
        return;
      }
      setContactTargetEmail(val);
      showToast('Form hedef e-postası güncellendi: ' + val);
    });

    const tabTextsBtn = document.getElementById('cms-tab-texts-btn');
    const tabImagesBtn = document.getElementById('cms-tab-images-btn');
    const tabSliderBtn = document.getElementById('cms-tab-slider-btn');

    tabTextsBtn.addEventListener('click', () => {
      activeTab = 'texts';
      tabTextsBtn.classList.add('active');
      tabImagesBtn.classList.remove('active');
      if (tabSliderBtn) tabSliderBtn.classList.remove('active');
      renderDrawer();
    });

    tabImagesBtn.addEventListener('click', () => {
      activeTab = 'images';
      tabImagesBtn.classList.add('active');
      tabTextsBtn.classList.remove('active');
      if (tabSliderBtn) tabSliderBtn.classList.remove('active');
      renderDrawer();
    });

    if (tabSliderBtn) {
      tabSliderBtn.addEventListener('click', () => {
        activeTab = 'slider';
        tabSliderBtn.classList.add('active');
        tabTextsBtn.classList.remove('active');
        tabImagesBtn.classList.remove('active');
        renderDrawer();
      });
    }

    document.getElementById('cms-search-input').addEventListener('input', () => {
      renderDrawer();
    });

    document.getElementById('cms-reset-page-btn').addEventListener('click', () => {
      if (!confirm('Bu sayfadaki TÜM yazı ve resim değişikliklerini varsayılana sıfırlamak istediğinize emin misiniz?')) return;
      const canonicalPage = getCanonicalPageKey();
      const allEdits = loadAllEdits();
      const storageKey = getPageKeyForStorage(allEdits, canonicalPage);
      delete allEdits[storageKey];
      if (window._SITE_DATA_ && window._SITE_DATA_[storageKey]) {
        delete window._SITE_DATA_[storageKey];
      }
      saveAllEdits(allEdits);

      // Reset texts
      editableElements.forEach((el) => {
        const id = el.getAttribute('data-cms-id');
        if (originalTexts[id] !== undefined) el.innerHTML = originalTexts[id];
      });

      // Reset images
      editableImages.forEach((img) => {
        if (originalImages[img.id] !== undefined) {
          img.setSrc(originalImages[img.id]);
        }
      });

      // Reset slider order
      if (originalHeroOrder) {
        const gallery = document.querySelector('#hero-gallery');
        if (gallery) {
          const slidesContainer = gallery.querySelector('.hero-slides');
          const thumbsContainer = gallery.querySelector('.hero-thumbnails');
          if (slidesContainer && thumbsContainer) {
            const currentSlides = Array.from(slidesContainer.querySelectorAll('.hero-slide'));
            const currentThumbs = Array.from(thumbsContainer.querySelectorAll('.hero-thumb'));
            originalHeroOrder.forEach((src) => {
              const s = currentSlides.find((el) => el.querySelector('img')?.getAttribute('src') === src);
              const t = currentThumbs.find((el) => el.querySelector('img')?.getAttribute('src') === src);
              if (s) slidesContainer.appendChild(s);
              if (t) thumbsContainer.appendChild(t);
            });
            if (heroGalleryCarousel) {
              heroGalleryCarousel.refreshNodes();
              heroGalleryCarousel.bindIndicators();
            }
          }
        }
      }

      renderDrawer();
      showToast('Sayfa yazı, resim ve slider sırası varsayılana döndürüldü.');
    });

    document.getElementById('cms-export-json-btn').addEventListener('click', () => {
      const allEdits = loadAllEdits();
      const canonicalPage = getCanonicalPageKey();
      const storageKey = getPageKeyForStorage(allEdits, canonicalPage);
      if (!allEdits[storageKey]) allEdits[storageKey] = {};

      // Include current slider order
      const gallery = document.querySelector('#hero-gallery');
      if (gallery) {
        const slides = Array.from(gallery.querySelectorAll('.hero-slides .hero-slide img')).map((img) => img.getAttribute('src'));
        allEdits[storageKey]._heroOrder = slides;
      }

      allEdits._meta = {
        title: '3EM Proje ve Danışmanlık',
        exportDate: new Date().toISOString(),
        version: '2.0',
        description: 'Tüm site ayarları, yazılar, resimler ve slider sırası yedeği'
      };

      const dataStr = JSON.stringify(allEdits, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'site-data.json';
      a.click();
      showToast('Tüm ayarlar "site-data.json" dosyası olarak indirildi!');
    });

    const fileInput = document.getElementById('cms-json-file');
    document.getElementById('cms-import-json-btn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (!parsed || typeof parsed !== 'object') throw new Error('Geçersiz format');
          saveAllEdits(parsed);
          window._SITE_DATA_ = parsed;
          indexEditableElements();
          renderDrawer();
          showToast('Tüm site ayarları JSON dosyasından başarıyla yüklendi!');
        } catch (_) {
          alert('Geçersiz JSON dosyası! Lütfen 3EM Admin tarafından dışa aktarılan bir JSON dosyası seçin.');
        }
      };
      reader.readAsText(file);
    });

    document.getElementById('cms-save-html-btn').addEventListener('click', async () => {
      // Clone document without Admin UI and save clean updated HTML
      const clone = document.documentElement.cloneNode(true);
      clone.querySelector('body').classList.remove('cms-edit-active');
      clone.querySelectorAll('.cms-admin-bar, .cms-drawer, .cms-toast, .cms-modal-backdrop, .lightbox-modal').forEach((n) => n.remove());
      clone.querySelectorAll('[contenteditable]').forEach((n) => n.removeAttribute('contenteditable'));
      clone.querySelectorAll('[spellcheck]').forEach((n) => n.removeAttribute('spellcheck'));
      clone.querySelectorAll('.hero-thumb').forEach((n) => {
        n.removeAttribute('draggable');
        n.classList.remove('drag-source', 'drag-over');
      });

      const htmlContent = '<!DOCTYPE html>\n' + clone.outerHTML;
      const fileName = window.location.pathname.split('/').pop() || 'index.html';

      if ('showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [{ description: 'HTML Dosyası', accept: { 'text/html': ['.html'] } }]
          });
          const writable = await handle.createWritable();
          await writable.write(htmlContent);
          await writable.close();
          showToast(fileName + ' dosyası doğrudan diske kaydedildi!');
          return;
        } catch (err) {
          if (err && err.name === 'AbortError') return;
        }
      }

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      showToast('Güncellenmiş ' + fileName + ' indirildi!');
    });
  }

  function moveHeroSlide(fromIdx, toIdx) {
    const gallery = document.querySelector('#hero-gallery');
    if (!gallery) return;
    const slidesContainer = gallery.querySelector('.hero-slides');
    const thumbsContainer = gallery.querySelector('.hero-thumbnails');
    if (!slidesContainer || !thumbsContainer) return;

    const slides = Array.from(slidesContainer.querySelectorAll('.hero-slide'));
    const thumbs = Array.from(thumbsContainer.querySelectorAll('.hero-thumb'));
    if (fromIdx < 0 || fromIdx >= slides.length || toIdx < 0 || toIdx >= slides.length || fromIdx === toIdx) return;

    const movingSlide = slides[fromIdx];
    const movingThumb = thumbs[fromIdx];

    if (toIdx > fromIdx) {
      slides[toIdx].after(movingSlide);
      thumbs[toIdx].after(movingThumb);
    } else {
      slides[toIdx].before(movingSlide);
      thumbs[toIdx].before(movingThumb);
    }

    if (heroGalleryCarousel) {
      heroGalleryCarousel.refreshNodes();
      heroGalleryCarousel.bindIndicators();
      heroGalleryCarousel.goTo(toIdx);
    }

    saveHeroSliderOrder();
    renderDrawer();
    setupPageThumbDragging(true);
    showToast(`Slayt sırası güncellendi! (Yeni Sıra: #${toIdx + 1})`);
  }

  function renderDrawer() {
    const listEl = document.getElementById('cms-fields-list');
    if (!listEl) return;
    const filterText = document.getElementById('cms-search-input')?.value || '';

    // Update counters
    const countTextsEl = document.getElementById('cms-count-texts');
    const countImagesEl = document.getElementById('cms-count-images');
    const countSlidesEl = document.getElementById('cms-count-slides');
    if (countTextsEl) countTextsEl.textContent = editableElements.length;
    if (countImagesEl) countImagesEl.textContent = editableImages.length;
    if (countSlidesEl) {
      countSlidesEl.textContent = document.querySelectorAll('#hero-gallery .hero-slide').length;
    }

    if (activeTab === 'texts') {
      renderDrawerTexts(listEl, filterText);
    } else if (activeTab === 'images') {
      renderDrawerImages(listEl, filterText);
    } else if (activeTab === 'slider') {
      renderDrawerSlider(listEl);
    }
  }

  function renderDrawerSlider(listEl) {
    listEl.innerHTML = '';
    const gallery = document.querySelector('#hero-gallery');
    if (!gallery) {
      listEl.innerHTML = '<div style="padding:24px;text-align:center;color:#94a3b8;">Bu sayfada slider bulunmuyor.</div>';
      return;
    }

    const slides = Array.from(gallery.querySelectorAll('.hero-slide'));
    const countSlidesEl = document.getElementById('cms-count-slides');
    if (countSlidesEl) countSlidesEl.textContent = slides.length;

    const infoBox = document.createElement('div');
    infoBox.className = 'cms-sortable-info-box';
    infoBox.innerHTML = `<span>💡 Slaytları fareyle <strong>sürükleyip bırakarak</strong> veya <strong>▲ / ▼</strong> butonlarıyla dilediğiniz gibi sıralayabilirsiniz.</span>`;
    listEl.appendChild(infoBox);

    const sortableList = document.createElement('div');
    sortableList.className = 'cms-sortable-list';

    let draggedIdx = null;

    slides.forEach((slide, i) => {
      const img = slide.querySelector('img');
      const src = img?.getAttribute('src') || '';
      const fileName = src.split('/').pop().split('?')[0] || `Slayt #${i + 1}`;

      const item = document.createElement('div');
      item.className = 'cms-sortable-item';
      item.setAttribute('draggable', 'true');
      item.dataset.index = i;

      item.innerHTML = `
        <span class="cms-drag-handle" title="Sürüklemek için tutun">☰</span>
        <span class="cms-sort-badge">${i + 1}</span>
        <img class="cms-sort-thumb" src="${src}" alt="Slayt ${i + 1}">
        <div class="cms-sort-title" title="${src}">${fileName}</div>
        <div class="cms-sort-arrows">
          <button type="button" class="btn-sort-up" title="Yukarı taşı" ${i === 0 ? 'disabled style="opacity:0.3;cursor:default;"' : ''}>▲</button>
          <button type="button" class="btn-sort-down" title="Aşağı taşı" ${i === slides.length - 1 ? 'disabled style="opacity:0.3;cursor:default;"' : ''}>▼</button>
        </div>
      `;

      item.querySelector('.btn-sort-up').addEventListener('click', (e) => {
        e.stopPropagation();
        if (i > 0) moveHeroSlide(i, i - 1);
      });

      item.querySelector('.btn-sort-down').addEventListener('click', (e) => {
        e.stopPropagation();
        if (i < slides.length - 1) moveHeroSlide(i, i + 1);
      });

      item.addEventListener('click', () => {
        if (heroGalleryCarousel) heroGalleryCarousel.goTo(i);
        slide.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      // Drag & Drop events
      item.addEventListener('dragstart', (e) => {
        draggedIdx = i;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', i);
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        sortableList.querySelectorAll('.cms-sortable-item').forEach((el) => el.classList.remove('drag-over'));
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        item.classList.add('drag-over');
      });

      item.addEventListener('dragleave', () => {
        item.classList.remove('drag-over');
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('drag-over');
        if (draggedIdx !== null && draggedIdx !== i) {
          moveHeroSlide(draggedIdx, i);
        }
      });

      sortableList.appendChild(item);
    });

    listEl.appendChild(sortableList);
  }

  function setupPageThumbDragging(enabled) {
    const gallery = document.querySelector('#hero-gallery');
    if (!gallery) return;
    const thumbsContainer = gallery.querySelector('.hero-thumbnails');
    if (!thumbsContainer) return;
    const thumbs = Array.from(thumbsContainer.querySelectorAll('.hero-thumb'));
    let pageDraggedIdx = null;

    thumbs.forEach((thumb) => {
      if (enabled) {
        thumb.setAttribute('draggable', 'true');
        thumb.ondragstart = (e) => {
          pageDraggedIdx = Array.from(thumbsContainer.children).indexOf(thumb);
          thumb.classList.add('drag-source');
          e.dataTransfer.effectAllowed = 'move';
        };
        thumb.ondragend = () => {
          thumb.classList.remove('drag-source');
          thumbsContainer.querySelectorAll('.hero-thumb').forEach((t) => t.classList.remove('drag-over'));
        };
        thumb.ondragover = (e) => {
          e.preventDefault();
          thumb.classList.add('drag-over');
        };
        thumb.ondragleave = () => {
          thumb.classList.remove('drag-over');
        };
        thumb.ondrop = (e) => {
          e.preventDefault();
          thumb.classList.remove('drag-over');
          const targetIdx = Array.from(thumbsContainer.children).indexOf(thumb);
          if (pageDraggedIdx !== null && pageDraggedIdx !== targetIdx) {
            moveHeroSlide(pageDraggedIdx, targetIdx);
          }
        };
      } else {
        thumb.removeAttribute('draggable');
        thumb.ondragstart = null;
        thumb.ondragend = null;
        thumb.ondragover = null;
        thumb.ondragleave = null;
        thumb.ondrop = null;
      }
    });
  }

  function renderDrawerTexts(listEl, filterText) {
    const q = (filterText || '').toLowerCase().trim();
    listEl.innerHTML = '';

    editableElements.forEach((el, i) => {
      const id = el.getAttribute('data-cms-id');
      const plainText = el.innerText.trim();
      if (!plainText && !el.innerHTML.trim()) return;
      if (q && !plainText.toLowerCase().includes(q)) return;

      const tag = el.tagName.toLowerCase();
      let typeLabel = 'Metin';
      if (/^h[1-6]$/.test(tag)) typeLabel = 'Başlık (' + tag.toUpperCase() + ')';
      else if (tag === 'a' || tag === 'button') typeLabel = 'Buton / Link';
      else if (tag === 'li') typeLabel = 'Liste Öğesi';
      else if (tag === 'blockquote') typeLabel = 'Alıntı';
      else if (tag === 'p') typeLabel = 'Paragraf';

      const item = document.createElement('div');
      item.className = 'cms-field-item';
      item.innerHTML = `
        <div class="cms-field-label">
          <span class="tag">${typeLabel}</span>
          <span>#${i + 1}</span>
        </div>
        <textarea class="cms-field-input" data-target-id="${id}" rows="${plainText.length > 90 ? 3 : 1}"></textarea>
      `;
      const textarea = item.querySelector('textarea');
      textarea.value = plainText;

      textarea.addEventListener('focus', () => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      textarea.addEventListener('input', () => {
        const htmlVal = textarea.value.replace(/\n/g, '<br>');
        updateElementText(id, htmlVal, false);
      });

      listEl.appendChild(item);
    });
  }

  function renderDrawerImages(listEl, filterText) {
    const q = (filterText || '').toLowerCase().trim();
    listEl.innerHTML = '';

    const drawerFilePicker = document.getElementById('cms-drawer-file-picker');

    editableImages.forEach((img, i) => {
      const currentSrc = img.src();
      const altText = img.alt || '';
      if (q && !altText.toLowerCase().includes(q) && !currentSrc.toLowerCase().includes(q)) return;

      const item = document.createElement('div');
      item.className = 'cms-img-item';
      item.innerHTML = `
        <img class="cms-img-thumb" src="${currentSrc}" alt="${altText}" title="Sayfada görmek için tıklayın">
        <div class="cms-img-info">
          <div class="tag">${img.type === 'bg' ? 'Arka Plan' : 'Görsel'} #${i + 1}</div>
          <div class="cms-img-path" title="${currentSrc}">${currentSrc.split('/').pop().split('?')[0] || 'Görsel'}</div>
          <div class="cms-img-actions">
            <button type="button" class="cms-btn primary btn-pick-file">📁 Değiştir</button>
            <button type="button" class="cms-btn btn-enter-url">🔗 Yol / URL</button>
          </div>
        </div>
      `;

      item.querySelector('.cms-img-thumb').addEventListener('click', () => {
        img.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      item.querySelector('.btn-pick-file').addEventListener('click', () => {
        drawerFilePicker.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            updateElementImage(img.id, reader.result);
          };
          reader.readAsDataURL(file);
        };
        drawerFilePicker.click();
      });

      item.querySelector('.btn-enter-url').addEventListener('click', () => {
        const promptVal = prompt('Yeni resim yolunu veya URL bağlantısını girin:', currentSrc);
        if (promptVal !== null && promptVal.trim() !== '') {
          updateElementImage(img.id, promptVal.trim());
        }
      });

      listEl.appendChild(item);
    });
  }

  function toggleAdminMode(forceState) {
    buildAdminUI();
    cmsActive = typeof forceState === 'boolean' ? forceState : !cmsActive;
    document.body.classList.toggle('cms-edit-active', cmsActive);
    adminBar.classList.toggle('open', cmsActive);
    adminDrawer.classList.toggle('open', cmsActive);

    // Toggle contenteditable for texts
    editableElements.forEach((el) => {
      if (cmsActive) {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'false');
      } else {
        el.removeAttribute('contenteditable');
      }
    });

    // Toggle direct on-page thumbnail dragging
    setupPageThumbDragging(cmsActive);

    if (cmsActive) {
      renderDrawer();
      showToast('Admin Modu Açıldı (Yazı, Resim ve Slider Sıralama Aktif)');
    } else {
      if (imgModalBackdrop) imgModalBackdrop.style.display = 'none';
      showToast('Değişiklikler kaydedildi ve düzenleme modu kapatıldı.');
    }
  }

  // Initialize editable elements and attach inline listeners
  indexEditableElements();
  syncServerSiteData();

  // Attach text inline listeners
  editableElements.forEach((el) => {
    el.addEventListener('click', (e) => {
      if (cmsActive) {
        if (el.tagName === 'A' || el.closest('a')) {
          e.preventDefault();
        }
        e.stopPropagation();
      }
    });

    el.addEventListener('input', () => {
      if (!cmsActive) return;
      const id = el.getAttribute('data-cms-id');
      updateElementText(id, el.innerHTML, true);
    });
  });

  // Attach image inline click listeners
  editableImages.forEach((img) => {
    img.el.addEventListener('click', (e) => {
      if (cmsActive) {
        e.preventDefault();
        e.stopPropagation();
        openImageModal(img);
      }
    });
  });

  // Listen for CTRL + SHIFT + ALT + E
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.altKey && (e.key === 'e' || e.key === 'E' || e.code === 'KeyE')) {
      e.preventDefault();
      toggleAdminMode();
    }
  });
})();
