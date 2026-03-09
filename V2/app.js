// Portfolio V2 – app.js
(function () {
  const html = document.documentElement;
  html.classList.remove('no-js');

  // ========== LOADER ==========
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('fade-out');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }, 2000);
  }

  // ========== THEME TOGGLE (avec anti-flash) ==========
  const THEME_KEY = 'pref-theme-v2';
  const initial = localStorage.getItem(THEME_KEY);
  if (initial === 'light') html.classList.add('light');

  const themeToggle = document.querySelector('.theme-toggle');
  themeToggle?.addEventListener('click', () => {
    // Classe transitioning pour éviter le flash
    html.classList.add('transitioning');
    html.classList.toggle('light');
    localStorage.setItem(
      THEME_KEY,
      html.classList.contains('light') ? 'light' : 'dark'
    );
    setTimeout(() => html.classList.remove('transitioning'), 450);
  });

  // ========== MOBILE NAVIGATION ==========
  const nav = document.querySelector('nav[aria-label="Navigation principale"]');
  const navToggle = document.querySelector('.nav-toggle');

  navToggle?.addEventListener('click', () => {
    const open = nav?.getAttribute('data-open') === 'true';
    nav?.setAttribute('data-open', String(!open));
  });

  if (nav) {
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
          nav.setAttribute('data-open', 'false');
        }
      });
    });
  }

  // ========== REVEAL ON SCROLL ==========
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('is-visible');
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      )
    : null;

  document.querySelectorAll('.reveal').forEach((el) => io?.observe(el));

  // ========== TIMELINE V2 ANIMATION ==========
  // Cards slide in from left or right on scroll
  const tlCardObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('is-visible');
              tlCardObserver.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
      )
    : null;

  document.querySelectorAll('.tl-v2-card-content').forEach((el) =>
    tlCardObserver?.observe(el)
  );

  // Animated timeline line — grows as user scrolls
  const tlLine = document.querySelector('.timeline-v2-line');
  if (tlLine && 'IntersectionObserver' in window) {
    const lineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            tlLine.classList.add('is-visible');
            lineObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05 }
    );
    lineObserver.observe(tlLine.parentElement || tlLine);
  }

  // ========== ACCORDION ==========
  document.querySelectorAll('.ac-item').forEach((item, idx) => {
    const trigger = item.querySelector('.ac-trigger');
    const panel = item.querySelector('.ac-panel');

    if (!trigger || !panel) return;

    const cid = panel.id || `ac-panel-${idx}`;
    panel.id = cid;
    trigger.setAttribute('aria-controls', cid);
    trigger.setAttribute(
      'aria-expanded',
      item.getAttribute('aria-expanded') === 'true' ? 'true' : 'false'
    );

    trigger.addEventListener('click', () => {
      const expanded = item.getAttribute('aria-expanded') === 'true';
      item.setAttribute('aria-expanded', String(!expanded));
      trigger.setAttribute('aria-expanded', String(!expanded));
    });
  });

  // ========== COPY EMAIL ==========
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.getAttribute('data-copy') || '');
        const original = btn.textContent;
        btn.textContent = 'Copié !';
        setTimeout(() => (btn.textContent = original), 1200);
      } catch (err) {
        console.error('Erreur copie:', err);
      }
    });
  });

  // ========== GALLERIES ==========
  document.querySelectorAll('.gallery').forEach((gallery) => {
    const viewerImg = gallery.querySelector('.viewer-img');
    const thumbs = gallery.querySelectorAll('.thumb');
    const counter = gallery.querySelector('.gallery-counter');

    if (!viewerImg || !thumbs.length) return;

    const updateCounter = (index) => {
      if (counter) {
        const current = counter.querySelector('.current');
        const total = counter.querySelector('.total');
        if (current) current.textContent = index + 1;
        if (total) total.textContent = thumbs.length;
      }
    };

    updateCounter(0);

    thumbs.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const src = btn.getAttribute('data-src');
        const alt = btn.getAttribute('data-alt') || viewerImg.alt;
        if (!src) return;
        viewerImg.src = src;
        viewerImg.alt = alt;
        thumbs.forEach((t) => t.classList.remove('is-active'));
        btn.classList.add('is-active');
        updateCounter(index);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (!gallery.matches(':hover')) return;
      const activeIndex = Array.from(thumbs).findIndex(t => t.classList.contains('is-active'));
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        thumbs[(activeIndex + 1) % thumbs.length].click();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        thumbs[(activeIndex - 1 + thumbs.length) % thumbs.length].click();
      }
    });
  });

  // ========== BACK TO TOP ==========
  const backToTopBtn = document.querySelector('.back-to-top');

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      backToTopBtn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ========== SKILL BARS ==========
  const skillBarsObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const progress = e.target.querySelector('.skill-progress');
              if (progress) {
                const val = progress.style.getPropertyValue('--progress');
                if (val) progress.style.width = val;
              }
              skillBarsObserver.unobserve(e.target);
            }
          });
        },
        { threshold: 0.4 }
      )
    : null;

  document.querySelectorAll('.skill-item').forEach((el) =>
    skillBarsObserver?.observe(el)
  );

  // ========== SMOOTH SCROLL ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', href);
      }
    });
  });

  // ========== PRELOAD ON HOVER ==========
  document.querySelectorAll('.ac-trigger').forEach(trigger => {
    trigger.addEventListener('mouseenter', function () {
      const panel = this.parentElement.querySelector('.ac-panel');
      if (panel) {
        panel.querySelectorAll('img[data-src]').forEach(img => {
          if (!img.src || img.src === window.location.href) {
            img.src = img.dataset.src;
          }
        });
      }
    }, { once: true });
  });

  // ========== CONTACT MODAL ==========
  const modal = document.getElementById('contactModal');

  function openModal() {
    if (!modal) return;
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    // Focus the first focusable element
    const firstFocusable = modal.querySelector(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href]'
    );
    setTimeout(() => firstFocusable?.focus(), 50);
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    // Return focus to the element that opened the modal
    const trigger = document.activeElement;
    document.querySelector('[data-open-contact]')?.focus();
  }

  // Open triggers
  document.querySelectorAll('[data-open-contact]').forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  // Close triggers
  document.querySelectorAll('[data-close-contact]').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  // Click on overlay backdrop (not modal content) closes
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // ESC key closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hasAttribute('hidden')) closeModal();
  });

  // Focus trap inside modal
  modal?.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(
      modal.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      )
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // ========== FORM VALIDATION ==========
  const contactForm = document.querySelector('form[action*="mailto"]');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      const name = contactForm.querySelector('#name');
      const email = contactForm.querySelector('#email');
      const message = contactForm.querySelector('#message');
      let isValid = true;

      if (name && name.value.trim().length < 2) {
        alert('Veuillez entrer un nom valide');
        isValid = false;
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        alert('Veuillez entrer un email valide');
        isValid = false;
      }

      if (message && message.value.trim().length < 10) {
        alert('Veuillez entrer un message (minimum 10 caractères)');
        isValid = false;
      }

      if (!isValid) e.preventDefault();
    });
  }

  // ========== EASTER EGG ==========
  let konamiCode = [];
  const konamiPattern = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

  document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode.splice(-konamiPattern.length - 1, konamiCode.length - konamiPattern.length);
    if (konamiCode.join('').includes(konamiPattern.join(''))) {
      document.body.style.animation = 'rainbow 2s linear infinite';
      setTimeout(() => { document.body.style.animation = ''; }, 5000);
    }
  });

  if (!document.getElementById('easter-egg-styles')) {
    const style = document.createElement('style');
    style.id = 'easter-egg-styles';
    style.textContent = `@keyframes rainbow { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }`;
    document.head.appendChild(style);
  }

  // ========== CERT-FR FEED ==========
  const certfrContainer = document.getElementById('certfr-feed');
  if (certfrContainer) {
    const CERTFR_RSS = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.cert.ssi.gouv.fr%2Ffeed%2F';

    function getCertfrType(title) {
      const t = title.toLowerCase();
      if (t.includes('alerte') || t.startsWith('certfr-') && t.includes('-ale-')) return 'alerte';
      if (t.includes('avis') || t.startsWith('certfr-') && t.includes('-avi-')) return 'avis';
      if (t.includes('cti') || t.includes('menace')) return 'cti';
      if (t.includes('ioc') || t.includes('indicateur')) return 'ioc';
      if (t.includes('durcissement')) return 'dur';
      return 'avis';
    }

    function getCertfrTypeFromLink(link) {
      if (link.includes('/alerte/')) return 'alerte';
      if (link.includes('/avis/')) return 'avis';
      if (link.includes('/cti/')) return 'cti';
      if (link.includes('/ioc/')) return 'ioc';
      if (link.includes('/dur/')) return 'dur';
      return null;
    }

    function escapeHtml(str) {
      const d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML;
    }

    function formatDate(dateStr) {
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch { return dateStr; }
    }

    function typeLabel(type) {
      const labels = { alerte: 'Alerte', avis: 'Avis', cti: 'CTI', ioc: 'IOC', dur: 'Durcissement' };
      return labels[type] || 'Avis';
    }

    fetch(CERTFR_RSS)
      .then(r => r.json())
      .then(data => {
        if (!data.items || !data.items.length) throw new Error('Aucun article');
        certfrContainer.innerHTML = data.items.slice(0, 8).map(item => {
          const type = getCertfrTypeFromLink(item.link) || getCertfrType(item.title);
          return `<article class="certfr-card reveal">
            <span class="certfr-card-type" data-type="${type}">${typeLabel(type)}</span>
            <div class="certfr-card-title"><a href="${escapeHtml(item.link)}" target="_blank" rel="noopener">${escapeHtml(item.title)}</a></div>
            <span class="certfr-card-date">${formatDate(item.pubDate)}</span>
          </article>`;
        }).join('');
        certfrContainer.querySelectorAll('.reveal').forEach(el => io?.observe(el));
      })
      .catch(() => {
        certfrContainer.innerHTML = `<div class="certfr-error">
          Impossible de charger le flux CERT-FR. <a href="https://www.cert.ssi.gouv.fr/" target="_blank" rel="noopener">Consulter directement le site</a>.
        </div>`;
      });
  }

  // ========== CONSOLE ==========
  console.log('%c👋 Portfolio V2 — Bento Grid Edition', 'font-size:18px;font-weight:bold;color:#4f9cf9;');
  console.log('%cDéveloppé par Mathis Rouvreau 🚀', 'font-size:13px;color:#9b7ef8;');
  console.log('%cHTML5 · CSS Grid · Vanilla JS · Dark/Light mode', 'font-size:11px;color:#8a96ae;');

})();
