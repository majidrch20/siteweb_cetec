/**
 * CETEC – Club ENSA Tétouan
 * script.js — JavaScript principal
 * ================================
 */

'use strict';

/* ============================================================
   1. NAVBAR — Sticky + Active link + Burger mobile
   ============================================================ */
(function initNavbar() {
  const navbar      = document.getElementById('navbar');
  const burger      = document.getElementById('nav-burger');
  const navMenu     = document.getElementById('nav-menu');
  const overlay     = document.getElementById('mobile-overlay');
  const navLinks    = document.querySelectorAll('.nav-link');

  if (!navbar || !burger || !navMenu) return;

  // Sticky: add class "scrolled" when user scrolls past 80px
  function handleScroll() {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Run once on load

  // Burger toggle
  function toggleMenu(open) {
    navMenu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (overlay) {
      overlay.classList.toggle('visible', open);
    }
    document.body.style.overflow = open ? 'hidden' : '';
  }

  burger.addEventListener('click', () => {
    const isOpen = navMenu.classList.contains('open');
    toggleMenu(!isOpen);
  });

  // Close menu when clicking overlay
  if (overlay) {
    overlay.addEventListener('click', () => toggleMenu(false));
  }

  // Close menu when clicking a nav link
  navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      toggleMenu(false);
    }
  });

  // Active link on scroll (IntersectionObserver)
  const sections = document.querySelectorAll('section[id]');
  const navLinkMap = {};
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      navLinkMap[href.slice(1)] = link;
    }
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = navLinkMap[entry.target.id];
        if (active) active.classList.add('active');
      }
    });
  }, {
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  });

  sections.forEach(sec => sectionObserver.observe(sec));
})();


/* ============================================================
   2. SCROLL ANIMATIONS — Intersection Observer (data-aos)
   ============================================================ */
(function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-aos]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Staggered delay for child elements within a group
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, 60);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();


/* ============================================================
   3. COUNTER ANIMATION — Stats section
   ============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('.count[data-target]');
  if (!counters.length) return;

  /**
   * Easing function: ease-out-cubic
   */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const type     = el.dataset.type || 'number';
    const duration = type === 'year' ? 1200 : 1800;
    const start    = type === 'year' ? 2000 : 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutCubic(progress);
      const current  = Math.round(start + (target - start) * eased);

      el.textContent = current.toLocaleString('fr-FR');

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString('fr-FR');
      }
    }

    requestAnimationFrame(update);
  }

  // Only animate when stats section becomes visible
  const statsSection = document.getElementById('stats');
  if (!statsSection) return;

  let animated = false;
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => animateCounter(counter));
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  statsObserver.observe(statsSection);
})();


/* ============================================================
   4. GALLERY FILTER
   ============================================================ */
(function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!filterBtns.length || !galleryItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show/hide items with animation
      galleryItems.forEach(item => {
        const category = item.dataset.category;
        const show = filter === 'all' || category === filter;

        if (show) {
          item.style.display = '';
          item.classList.remove('hidden');
          // Fade in
          requestAnimationFrame(() => {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.9)';
            requestAnimationFrame(() => {
              item.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            });
          });
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.9)';
          setTimeout(() => {
            item.classList.add('hidden');
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
})();


/* ============================================================
   5. CONTACT FORM — Validation + Fake submit
   ============================================================ */
(function initContactForm() {
  const form        = document.getElementById('contactForm');
  const btnText     = document.getElementById('btn-submit-text');
  const btnIcon     = document.getElementById('btn-submit-icon');
  const successMsg  = document.getElementById('form-success');

  if (!form) return;

  /**
   * Validate a single field
   * @param {HTMLElement} input
   * @param {HTMLElement} errorEl
   * @returns {boolean}
   */
  function validateField(input, errorEl) {
    const value = input.value.trim();
    let error   = '';

    if (!value) {
      error = 'Ce champ est requis.';
    } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Veuillez entrer une adresse email valide.';
    } else if (input.tagName.toLowerCase() === 'textarea' && value.length < 10) {
      error = 'Le message doit contenir au moins 10 caractères.';
    }

    errorEl.textContent = error;

    if (error) {
      input.style.borderColor = '#ff6b6b';
      return false;
    } else {
      input.style.borderColor = 'rgba(72,191,197,0.5)';
      return true;
    }
  }

  // Live validation on blur
  const fields = [
    { input: document.getElementById('contact-name'),         error: document.getElementById('error-name')    },
    { input: document.getElementById('contact-email-input'),  error: document.getElementById('error-email')   },
    { input: document.getElementById('contact-subject'),      error: document.getElementById('error-subject') },
    { input: document.getElementById('contact-message'),      error: document.getElementById('error-message') },
  ];

  fields.forEach(({ input, error }) => {
    if (!input || !error) return;
    input.addEventListener('blur', () => validateField(input, error));
    input.addEventListener('input', () => {
      if (error.textContent) validateField(input, error);
    });
  });

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all fields
    let valid = true;
    fields.forEach(({ input, error }) => {
      if (!input || !error) return;
      if (!validateField(input, error)) valid = false;
    });

    if (!valid) return;

    // Send data to live PHP backend with local fallback for static previews
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Envoi en cours...';
    if (btnIcon) {
      btnIcon.className = 'fa-solid fa-spinner fa-spin';
    }

    const formData = new FormData(form);

    // If running on Live Server (e.g. port 5500) or file://, direct requests to XAMPP backend on port 80
    const isLocal = window.location.protocol === 'file:' || (window.location.port && window.location.port !== '80' && window.location.port !== '443');
    const fetchUrl = isLocal ? 'http://localhost/siteweb_cetec/contact.php' : 'contact.php';

    fetch(fetchUrl, {
      method: 'POST',
      body: formData
    })
    .then(async response => {
      let data;
      try {
        data = await response.json();
      } catch (e) {
        // Not a JSON response
      }

      if (response.ok && data && data.status === 'success') {
        return data;
      } else {
        const msg = (data && data.message) ? data.message : `Erreur serveur (${response.status})`;
        throw new Error(msg);
      }
    })
    .then(data => {
      if (successMsg) {
        successMsg.className = 'form-success';
        successMsg.style.background = '';
        successMsg.style.borderColor = '';
        successMsg.style.color = '';
        const icon = successMsg.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-circle-check';
        successMsg.querySelector('span').textContent = data.message;
        successMsg.style.display = 'flex';
      }
      form.reset();
      fields.forEach(({ input }) => {
        if (input) input.style.borderColor = '';
      });
    })
    .catch(error => {
      console.warn("Erreur de soumission :", error);
      
      if (isLocal) {
        // We are previewing locally, and the connection to local XAMPP backend failed
        if (successMsg) {
          successMsg.className = 'form-success form-warning-fallback';
          successMsg.style.background = 'rgba(247, 148, 29, 0.12)';
          successMsg.style.borderColor = 'rgba(247, 148, 29, 0.4)';
          successMsg.style.color = '#f7941d';
          const icon = successMsg.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-triangle-exclamation';
          successMsg.querySelector('span').innerHTML = "<strong>Message simulé !</strong><br><small style='font-size:0.8rem;opacity:0.95;'>Pour enregistrer en BDD depuis Live Server, assurez-vous d'avoir démarré Apache et MySQL dans XAMPP.</small>";
          successMsg.style.display = 'flex';
        }
        form.reset();
        fields.forEach(({ input }) => {
          if (input) input.style.borderColor = '';
        });
      } else {
        // Actual server/database error
        if (successMsg) {
          successMsg.className = 'form-success form-error-fallback';
          successMsg.style.background = 'rgba(255, 107, 107, 0.12)';
          successMsg.style.borderColor = 'rgba(255, 107, 107, 0.4)';
          successMsg.style.color = '#ff6b6b';
          const icon = successMsg.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-circle-xmark';
          successMsg.querySelector('span').innerHTML = "<strong>Échec de l'envoi :</strong> " + error.message;
          successMsg.style.display = 'flex';
        }
      }
    })
    .finally(() => {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Contacter';
      if (btnIcon) btnIcon.className = 'fa-solid fa-paper-plane';

      // Hide success after 10 seconds (giving more time to read warnings)
      setTimeout(() => {
        if (successMsg) successMsg.style.display = 'none';
      }, 10000);
    });
  });
})();


/* ============================================================
   6. SMOOTH SCROLL — For all anchor links
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h'), 10) || 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    });
  });
})();


/* ============================================================
   7. BACK TO TOP BUTTON
   ============================================================ */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   8. HERO PARALLAX — Subtle parallax on hero bg
   ============================================================ */
(function initParallax() {
  const heroBg = document.querySelector('.hero-bg-img');
  if (!heroBg) return;

  // Only enable on non-touch devices for performance
  if (window.matchMedia('(pointer: coarse)').matches) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroH   = document.querySelector('.hero')?.offsetHeight || window.innerHeight;

    if (scrollY <= heroH) {
      const offset = scrollY * 0.3;
      heroBg.style.transform = `translateY(${offset}px)`;
    }
  }, { passive: true });
})();


/* ============================================================
   9. CARD TILT EFFECT — Subtle 3D tilt on value cards
   ============================================================ */
(function initCardTilt() {
  const cards = document.querySelectorAll('.value-card, .activity-card-inner');
  if (!cards.length) return;

  // Only on desktop (pointer: fine)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
})();


/* ============================================================
   10. TYPED TEXT EFFECT — Hero subtitle
   ============================================================ */
(function initTypedEffect() {
  const subtitle = document.querySelector('.hero-subtitle');
  if (!subtitle) return;

  const text = subtitle.textContent.trim();
  subtitle.textContent = '';

  // Wait a bit before starting
  setTimeout(() => {
    let i = 0;
    function typeChar() {
      if (i < text.length) {
        subtitle.textContent += text.charAt(i);
        i++;
        setTimeout(typeChar, 40 + Math.random() * 20);
      }
    }
    typeChar();
  }, 1000);
})();


/* ============================================================
   11. HERO SHAPES — Mouse parallax
   ============================================================ */
(function initShapeParallax() {
  const shapes = document.querySelectorAll('.shape');
  if (!shapes.length) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    shapes.forEach((shape, index) => {
      const factor = (index + 1) * 8;
      shape.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  });
})();


/* ============================================================
   12. VIDEOS PLAYER — Handle click on placeholders & Tab switching
   ============================================================ */
(function initVideoShowcase() {
  const showcase  = document.getElementById('video-showcase');
  if (!showcase) return;

  const track     = document.getElementById('vshow-track');
  const slides    = showcase.querySelectorAll('.vshow-slide');
  const thumbs    = showcase.querySelectorAll('.vshow-dot-btn');
  const prevBtn   = document.getElementById('vshow-prev');
  const nextBtn   = document.getElementById('vshow-next');
  const swipeHint = document.getElementById('vshow-swipe-hint');
  const soundBtns = showcase.querySelectorAll('.vshow-sound-btn');
  const videos    = showcase.querySelectorAll('.vshow-video');

  let current = 0;
  const total = slides.length;
  let isMuted = true; // Videos must start muted for autoplay compliance

  function updateMuteState() {
    videos.forEach(vid => {
      vid.muted = isMuted;
    });

    soundBtns.forEach(btn => {
      const icon = btn.querySelector('i');
      if (isMuted) {
        btn.classList.remove('unmuted');
        if (icon) icon.className = 'fa-solid fa-volume-xmark';
      } else {
        btn.classList.add('unmuted');
        if (icon) icon.className = 'fa-solid fa-volume-high';
      }
    });
  }

  // Bind click event to all sound buttons
  soundBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      isMuted = !isMuted;
      updateMuteState();
    });
  });

  /* ---- Go to slide + autoplay ---- */
  function goTo(index) {
    if (index < 0 || index >= total) return;

    // Pause all other videos & reset their time
    slides.forEach((slide, i) => {
      const vid = slide.querySelector('.vshow-video');
      if (vid && i !== index) {
        vid.pause();
        vid.currentTime = 0;
      }
    });

    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;

    // Update thumbnail strip active state
    thumbs.forEach(t => t.classList.remove('active'));
    if (thumbs[current]) thumbs[current].classList.add('active');

    // Arrow states
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;

    // Hide swipe hint once navigated
    if (swipeHint && current > 0) swipeHint.classList.add('gone');

    // Autoplay the current video
    const activeVideo = slides[current].querySelector('.vshow-video');
    if (activeVideo) {
      activeVideo.muted = isMuted;
      activeVideo.play().catch(() => {
        // If play failed and it was unmuted, try playing muted as fallback
        if (!activeVideo.muted) {
          isMuted = true;
          updateMuteState();
          activeVideo.play().catch(() => {});
        }
      });
    }
  }

  /* ---- Arrows ---- */
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  /* ---- Thumbnail strip ---- */
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      goTo(parseInt(thumb.getAttribute('data-slide'), 10));
    });
  });

  /* ---- Keyboard ---- */
  document.addEventListener('keydown', e => {
    const rect = showcase.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  /* ---- Touch / Swipe ---- */
  let touchStartX = 0;
  let isDragging  = false;

  showcase.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    isDragging  = false;
  }, { passive: true });

  showcase.addEventListener('touchmove', () => {
    isDragging = true;
  }, { passive: true });

  showcase.addEventListener('touchend', e => {
    if (!isDragging) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goTo(current + 1); // swipe left → next
      else         goTo(current - 1); // swipe right → prev
    }
    isDragging = false;
  }, { passive: true });

  /* ---- Auto-hide swipe hint after 4s ---- */
  if (swipeHint) setTimeout(() => swipeHint.classList.add('gone'), 4000);

  /* ---- Init: set arrows + thumbs (no autoplay yet, wait for user scroll) ---- */
  prevBtn.disabled = true;
  nextBtn.disabled = total <= 1;
  thumbs[0] && thumbs[0].classList.add('active');

  /* ---- Autoplay / Pause video depending on section visibility ---- */
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const activeVideo = slides[current].querySelector('.vshow-video');
      if (entry.isIntersecting) {
        if (activeVideo) {
          activeVideo.muted = isMuted;
          activeVideo.play().catch(() => {});
        }
      } else {
        if (activeVideo) {
          activeVideo.pause();
        }
      }
    });
  }, { threshold: 0.2 });
  sectionObserver.observe(showcase);
})();



/* ============================================================
   13. LIVRE D'OR (GUESTBOOK) — LocalStorage-based Post-its
   ============================================================ */
(function initGuestbook() {
  const form = document.getElementById('guestbook-form');
  const board = document.getElementById('guestbook-board');
  const nameInput = document.getElementById('guestbook-name');
  const roleSelect = document.getElementById('guestbook-role');
  const messageInput = document.getElementById('guestbook-message');
  const errorName = document.getElementById('error-guest-name');
  const errorMessage = document.getElementById('error-guest-message');

  if (!form || !board) return;

  const defaultMessages = [
    {
      id: 1,
      name: "Yasmine El Fassi",
      role: "Alumni / Ancien membre",
      message: "Le CETEC m'a permis de vaincre ma timidité et de prendre la parole en public avec assurance. Une expérience inoubliable !",
      date: "12 oct. 2025"
    },
    {
      id: 2,
      name: "Amine Belhadj",
      role: "Membre Actif",
      message: "Plus qu'un club, une véritable famille d'échange intellectuel et de partage au sein de l'ENSA Tétouan.",
      date: "18 déc. 2025"
    },
    {
      id: 3,
      name: "Prof. Karim Tazi",
      role: "Visiteur",
      message: "Bravo pour cette magnifique plateforme et pour le dynamisme des étudiants ingénieurs. Longue vie au CETEC !",
      date: "05 fév. 2026"
    },
    {
      id: 4,
      name: "Salma Riffi",
      role: "Alumni / Ancien membre",
      message: "Des souvenirs gravés à jamais entre débats animés, actions sociales et cafés littéraires inspirants.",
      date: "20 avr. 2026"
    }
  ];

  // Retrieve messages from localStorage or use defaults
  function getMessages() {
    const saved = localStorage.getItem('cetec_guestbook_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing local storage", e);
      }
    }
    // Set defaults in localStorage
    localStorage.setItem('cetec_guestbook_messages', JSON.stringify(defaultMessages));
    return defaultMessages;
  }

  // Save messages to localStorage
  function saveMessages(messages) {
    localStorage.setItem('cetec_guestbook_messages', JSON.stringify(messages));
  }

  // Render all messages
  function renderMessages() {
    const messages = getMessages();
    board.innerHTML = '';
    messages.forEach((msg, index) => {
      createNoteElement(msg, index);
    });
  }

  // Create a post-it note HTML element
  function createNoteElement(msg, index, animate = false) {
    const note = document.createElement('div');
    
    // Choose a color class based on index (cycles 1 to 4)
    const colorNum = (index % 4) + 1;
    note.className = `guestbook-note note-color-${colorNum}`;
    
    // Assign a random rotation between -4deg and +4deg for a natural post-it look
    const randomRotation = (Math.random() * 8 - 4).toFixed(1);
    note.style.transform = `rotate(${randomRotation}deg)`;
    
    note.innerHTML = `
      <div class="note-content">"${escapeHTML(msg.message)}"</div>
      <div class="note-meta">
        <div class="note-author">${escapeHTML(msg.name)}</div>
        <div class="note-role">${escapeHTML(msg.role)}</div>
        <div class="note-date">${msg.date}</div>
      </div>
    `;

    if (animate) {
      note.style.animation = 'postitPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both';
      board.insertBefore(note, board.firstChild);
    } else {
      board.appendChild(note);
    }
  }

  // Helper to escape HTML and prevent XSS
  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Form validation helper
  function validateForm() {
    let isValid = true;

    // Name validation
    if (!nameInput.value.trim()) {
      errorName.textContent = "Veuillez entrer votre nom.";
      nameInput.style.borderColor = "#ff6b6b";
      isValid = false;
    } else {
      errorName.textContent = "";
      nameInput.style.borderColor = "";
    }

    // Message validation
    if (!messageInput.value.trim()) {
      errorMessage.textContent = "Veuillez écrire un message.";
      messageInput.style.borderColor = "#ff6b6b";
      isValid = false;
    } else if (messageInput.value.trim().length < 5) {
      errorMessage.textContent = "Le message doit contenir au moins 5 caractères.";
      messageInput.style.borderColor = "#ff6b6b";
      isValid = false;
    } else {
      errorMessage.textContent = "";
      messageInput.style.borderColor = "";
    }

    return isValid;
  }

  // Handle submit
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const messages = getMessages();
    
    // Get formatted date
    const dateOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const dateStr = new Date().toLocaleDateString('fr-FR', dateOptions);

    const newMsg = {
      id: Date.now(),
      name: nameInput.value.trim(),
      role: roleSelect.value,
      message: messageInput.value.trim(),
      date: dateStr
    };

    // Prepend to messages list
    messages.unshift(newMsg);
    saveMessages(messages);

    // Add to DOM with animation
    createNoteElement(newMsg, 0, true);

    // Reset inputs
    form.reset();

    // Smooth scroll to the top of the board to see the new post-it
    const boardWrap = document.querySelector('.guestbook-board-wrap');
    if (boardWrap) {
      boardWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // Initial render
  renderMessages();
})();


/* ============================================================
   14. AGENDA TABS — Switch between upcoming and past events
   ============================================================ */
(function initAgendaTabs() {
  const tabBtns = document.querySelectorAll('.agenda-tab-btn');
  const panes = document.querySelectorAll('.agenda-pane');

  if (!tabBtns.length || !panes.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.dataset.tab;

      // Update active button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active pane
      panes.forEach(pane => {
        if (pane.id === `pane-${tabTarget}`) {
          pane.style.display = 'block';
          // Force reflow
          pane.offsetHeight;
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
          pane.style.display = 'none';
        }
      });
    });
  });
})();
