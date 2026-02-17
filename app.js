// Portfolio app.js – Version enrichie Senior
(function () {
  const html = document.documentElement;
  html.classList.remove('no-js');

  // ========== THEME TOGGLE ==========
  const THEME_KEY = 'pref-theme';
  const initial = localStorage.getItem(THEME_KEY);
  if (initial === 'light') html.classList.add('light');
  
  const themeToggle = document.querySelector('.theme-toggle');
  themeToggle?.addEventListener('click', () => {
    html.classList.toggle('light');
    localStorage.setItem(
      THEME_KEY,
      html.classList.contains('light') ? 'light' : 'dark'
    );
  });

  // ========== MOBILE NAVIGATION ==========
  const nav = document.querySelector('nav[aria-label="Navigation principale"]');
  const navToggle = document.querySelector('.nav-toggle');
  
  navToggle?.addEventListener('click', () => {
    const open = nav?.getAttribute('data-open') === 'true';
    nav?.setAttribute('data-open', String(!open));
  });

  // Fermer le menu au clic sur un lien (mobile)
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
        { threshold: 0.12 }
      )
    : null;

  document.querySelectorAll('.reveal').forEach((el) => io?.observe(el));

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

  // ========== COPY EMAIL HELPER ==========
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

  // ========== GALLERIES (Image carousels) ==========
  document.querySelectorAll('.gallery').forEach((gallery) => {
    const viewerImg = gallery.querySelector('.viewer-img');
    const thumbs = gallery.querySelectorAll('.thumb');
    const counter = gallery.querySelector('.gallery-counter');

    if (!viewerImg || !thumbs.length) return;

    // Fonction pour mettre à jour le compteur
    const updateCounter = (index) => {
      if (counter) {
        const current = counter.querySelector('.current');
        const total = counter.querySelector('.total');
        if (current) current.textContent = index + 1;
        if (total) total.textContent = thumbs.length;
      }
    };

    // Initialiser le compteur
    updateCounter(0);

    // Navigation par clic sur les vignettes
    thumbs.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const src = btn.getAttribute('data-src');
        const alt = btn.getAttribute('data-alt') || viewerImg.alt;

        if (!src) return;

        viewerImg.src = src;
        viewerImg.alt = alt;

        // État actif sur la vignette
        thumbs.forEach((t) => t.classList.remove('is-active'));
        btn.classList.add('is-active');

        // Mise à jour du compteur
        updateCounter(index);
      });
    });

    // Navigation clavier (flèches gauche/droite)
    document.addEventListener('keydown', (e) => {
      if (!gallery.matches(':hover')) return;

      const activeIndex = Array.from(thumbs).findIndex(t => t.classList.contains('is-active'));

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (activeIndex + 1) % thumbs.length;
        thumbs[nextIndex].click();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = (activeIndex - 1 + thumbs.length) % thumbs.length;
        thumbs[prevIndex].click();
      }
    });
  });

  // ========== BACK TO TOP BUTTON ==========
  const backToTopBtn = document.querySelector('.back-to-top');
  
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ========== SKILL BARS ANIMATION ==========
  // Animer les barres de compétences quand elles deviennent visibles
  const skillBarsObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const progress = e.target.querySelector('.skill-progress');
              if (progress) {
                // Déclencher l'animation CSS
                progress.style.width = progress.style.getPropertyValue('--progress') || '0%';
              }
              skillBarsObserver.unobserve(e.target);
            }
          });
        },
        { threshold: 0.5 }
      )
    : null;

  document.querySelectorAll('.skill-item').forEach((el) => skillBarsObserver?.observe(el));

  // ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href) return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Mettre à jour l'URL sans scroll
        history.pushState(null, '', href);
      }
    });
  });

  // ========== LAZY LOADING IMAGES ==========
  // Pour les images avec loading="lazy" non supporté
  if ('loading' in HTMLImageElement.prototype) {
    // Le navigateur supporte loading="lazy"
  } else {
    // Fallback pour les vieux navigateurs
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          imageObserver.unobserve(img);
        }
      });
    });
    lazyImages.forEach((img) => imageObserver.observe(img));
  }

  // ========== FORM VALIDATION (Contact page) ==========
  const contactForm = document.querySelector('form[action*="mailto"]');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      const name = contactForm.querySelector('#name');
      const email = contactForm.querySelector('#email');
      const message = contactForm.querySelector('#message');

      let isValid = true;

      // Validation simple
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

      if (!isValid) {
        e.preventDefault();
      }
    });
  }

  // ========== PERFORMANCE: PRELOAD IMAGES ON HOVER ==========
  // Précharger les images des projets au survol des accordéons
  document.querySelectorAll('.ac-trigger').forEach(trigger => {
    trigger.addEventListener('mouseenter', function() {
      const panel = this.parentElement.querySelector('.ac-panel');
      if (panel) {
        const images = panel.querySelectorAll('img[data-src]');
        images.forEach(img => {
          if (!img.src || img.src === window.location.href) {
            img.src = img.dataset.src;
          }
        });
      }
    }, { once: true });
  });

  // ========== EASTER EGG: KONAMI CODE ==========
  let konamiCode = [];
  const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  
  document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode.splice(-konamiPattern.length - 1, konamiCode.length - konamiPattern.length);
    
    if (konamiCode.join('').includes(konamiPattern.join(''))) {
      document.body.style.animation = 'rainbow 2s linear infinite';
      setTimeout(() => {
        document.body.style.animation = '';
      }, 5000);
    }
  });

  // Ajouter l'animation rainbow au CSS si activée
  if (!document.getElementById('easter-egg-styles')) {
    const style = document.createElement('style');
    style.id = 'easter-egg-styles';
    style.textContent = `
      @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // ========== CONSOLE MESSAGE ==========
  console.log(
    '%c👋 Salut ! Tu inspectes le code ?',
    'font-size: 20px; font-weight: bold; color: #7cd2ff;'
  );
  console.log(
    '%cCe portfolio a été développé par Mathis Rouvreau 🚀',
    'font-size: 14px; color: #a6b0c3;'
  );
  console.log(
    '%cTech stack: HTML5, CSS3 (variables, grid, flexbox), JavaScript vanilla',
    'font-size: 12px; color: #7f7bff;'
  );
  console.log(
    '%cPour me contacter: mathis.rouvreau@gmail.com',
    'font-size: 12px; color: #4ade80;'
  );

})();