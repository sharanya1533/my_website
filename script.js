/* 
  Futuristic Minimal Portfolio
  Tech: Vanilla JS only
  Features:
  - Smooth scroll + header offset + scroll spy
  - Typing effect
  - Canvas particles background
  - IntersectionObserver reveal animations
  - Skills bar animation
  - Modal with simple slider
  - Scroll progress bar
  - Form validation w/o reload
  - Theme toggle (localStorage) + prefers-color-scheme
  - Back-to-top button
  - Lazy-friendly images (native loading)
*/

(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const header = $('#header');
  const headerH = () => header.getBoundingClientRect().height;

  /* --------------------------------
     Theme Toggle (dark/light)
  ----------------------------------*/
  const THEME_KEY = 'pref-theme';
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light'); // start with system preference
      // Override to dark by default per design
      applyTheme('dark');
    }
  }
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  }
  $('#themeToggle').addEventListener('click', toggleTheme);
  initTheme();

  /* --------------------------------
     Smooth Scroll with offset
  ----------------------------------*/
  function smoothScrollTo(target) {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - headerH() + 1;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  // Nav links
  $$('.nav__link').forEach(a => {
    a.addEventListener('click', e => {
      if (a.hash) {
        e.preventDefault();
        smoothScrollTo(a.hash);
      }
    });
  });
  // Scroll-down indicator
  $$('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', () => smoothScrollTo(btn.getAttribute('data-scroll-to')));
  });

  /* --------------------------------
     Scroll Progress Indicator
  ----------------------------------*/
  const progressBar = $('#scrollProgress');
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const winH = window.innerHeight;
    const progress = Math.min(100, Math.max(0, (scrollTop / (docH - winH)) * 100));
    progressBar.style.width = progress + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress);
  updateScrollProgress();

  /* --------------------------------
     Scroll Spy (Active nav link)
  ----------------------------------*/
  const sections = ['home', 'about', 'skills', 'projects', 'contact'].map(id => $('#' + id));
  const navLinks = new Map($$('.nav__link').map(a => [a.getAttribute('href').slice(1), a]));
  const spyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => link.classList.remove('is-active'));
        const active = navLinks.get(id);
        if (active) active.classList.add('is-active');
      }
    });
  }, { rootMargin: `-${Math.floor(headerH())}px 0px -60% 0px`, threshold: 0.1 });
  sections.forEach(s => spyObserver.observe(s));

  /* --------------------------------
     Reveal Animations
  ----------------------------------*/
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* --------------------------------
     Typing Effect
  ----------------------------------*/
  const typedTarget = $('#typedText');
  const phrases = [
    'Crafting elegant interfaces with purpose.',
    'Performance, accessibility, and detail.',
    'HTML · CSS · JavaScript — no dependencies.'
  ];
  const typingSpeed = 45;
  const backspaceSpeed = 28;
  const holdTime = 1100;
  let phraseIndex = 0, charIndex = 0, isDeleting = false;

  function typeLoop() {
    const current = phrases[phraseIndex];
    if (!isDeleting) {
      typedTarget.textContent = current.slice(0, ++charIndex);
      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(typeLoop, holdTime);
        return;
      }
    } else {
      typedTarget.textContent = current.slice(0, --charIndex);
      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    const delay = isDeleting ? backspaceSpeed : typingSpeed;
    setTimeout(typeLoop, delay);
  }
  typeLoop();

  /* --------------------------------
     Canvas Particles Background
  ----------------------------------*/
  const canvas = $('#heroCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });

  let particles = [];
  let dpi = window.devicePixelRatio || 1;
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpi;
    canvas.height = rect.height * dpi;
    ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
  }
  function initParticles() {
    const rect = canvas.getBoundingClientRect();
    const area = rect.width * rect.height;
    const density = 0.00009; // tune for performance
    const count = Math.min(140, Math.max(40, Math.floor(area * density)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.5
    }));
  }
  function getColorStops() {
    const styles = getComputedStyle(document.documentElement);
    return [styles.getPropertyValue('--primary').trim(), styles.getPropertyValue('--secondary').trim()];
  }
  function draw() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    const [c1, c2] = getColorStops();

    // subtle gradient overlay
    const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    g.addColorStop(0, c1 + '22'); // transparent variants
    g.addColorStop(1, c2 + '22');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // particles
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > rect.width) p.vx *= -1;
      if (p.y < 0 || p.y > rect.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = c1;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // connections
    const threshold = Math.min(160, Math.max(80, rect.width * 0.09));
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < threshold) {
          ctx.strokeStyle = c2 + 'aa';
          ctx.globalAlpha = 1 - dist / threshold;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    requestAnimationFrame(draw);
  }
  function setupCanvas() {
    resizeCanvas();
    initParticles();
    draw();
  }
  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
    initParticles();
  });
  resizeObserver.observe(canvas);
  setupCanvas();

  /* --------------------------------
     Skills Progress Animation
  ----------------------------------*/
  const bars = $$('.skill__bar');
  const skillsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const fill = $('.skill__bar-fill', bar);
        const p = bar.getAttribute('data-progress') || '0';
        fill.style.width = '0%'; // ensure start
        requestAnimationFrame(() => { fill.style.width = `${p}%`; });
        // Also set CSS var for declarative width if needed:
        bar.style.setProperty('--p', `${p}%`);
        obs.unobserve(bar);
      }
    });
  }, { threshold: 0.4 });
  bars.forEach(b => skillsObserver.observe(b));

  /* --------------------------------
     Modal + Slider
  ----------------------------------*/
  const modal = $('#projectModal');
  const track = $('#sliderTrack');
  const titleEl = $('#modalTitle');
  const descEl = $('.modal__desc', modal);
  let slideIndex = 0;
  let slidesCount = 0;

  function openModal({ title, description, images }) {
    titleEl.textContent = title;
    descEl.textContent = description;

    track.innerHTML = '';
    images.forEach(css => {
      const slide = document.createElement('div');
      slide.className = 'slider__slide';
      slide.style.setProperty('--bg-slide', css);
      track.appendChild(slide);
    });
    slidesCount = images.length;
    slideIndex = 0;
    updateSlider();

    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.focus();
  }
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function updateSlider() {
    const viewport = $('.slider__viewport', modal);
    const w = viewport.getBoundingClientRect().width;
    track.style.transform = `translateX(${-slideIndex * w}px)`;
  }
  function nextSlide() {
    slideIndex = (slideIndex + 1) % slidesCount;
    updateSlider();
  }
  function prevSlide() {
    slideIndex = (slideIndex - 1 + slidesCount) % slidesCount;
    updateSlider();
  }

  // Open buttons
  $$('.project-card__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title') || 'Project';
      const description = btn.getAttribute('data-description') || '';
      let images = [];
      try {
        images = JSON.parse(btn.getAttribute('data-images') || '[]');
      } catch (e) { images = []; }
      if (!images.length) images = ['linear-gradient(135deg, #00d1ff, #7b61ff)'];
      openModal({ title, description, images });
    });
  });
  // Modal controls
  modal.addEventListener('click', (e) => {
    const t = e.target;
    if (t.matches('[data-close="modal"]')) closeModal();
    if (t.classList.contains('slider__ctrl--next')) nextSlide();
    if (t.classList.contains('slider__ctrl--prev')) prevSlide();
  });
  window.addEventListener('keydown', (e) => {
    if (modal.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    }
  });
  // Resize slider on viewport resize
  window.addEventListener('resize', () => {
    if (modal.getAttribute('aria-hidden') === 'false') updateSlider();
  });

  /* --------------------------------
     Contact Form Validation
  ----------------------------------*/
  const form = $('#contactForm');
  const note = $('#formNote');
  const fields = {
    name: $('#name'),
    email: $('#email'),
    message: $('#message')
  };
  const errors = {
    name: $('#error-name'),
    email: $('#error-email'),
    message: $('#error-message')
  };

  function validateName() {
    const v = fields.name.value.trim();
    const ok = v.length >= 2;
    setFieldState('name', ok, ok ? '' : 'Please enter at least 2 characters.');
    return ok;
  }
  function validateEmail() {
    const v = fields.email.value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    setFieldState('email', ok, ok ? '' : 'Please enter a valid email address.');
    return ok;
  }
  function validateMessage() {
    const v = fields.message.value.trim();
    const ok = v.length >= 10;
    setFieldState('message', ok, ok ? '' : 'Please include a few more details (min 10 chars).');
    return ok;
  }
  function setFieldState(key, ok, msg) {
    fields[key].classList.toggle('invalid', !ok);
    errors[key].textContent = msg;
  }
  ['input', 'blur'].forEach(evt => fields.name.addEventListener(evt, validateName));
  ['input', 'blur'].forEach(evt => fields.email.addEventListener(evt, validateEmail));
  ['input', 'blur'].forEach(evt => fields.message.addEventListener(evt, validateMessage));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = validateName() & validateEmail() & validateMessage(); // bitwise but fine for booleans here
    if (!ok) return;

    const submitBtn = $('button[type="submit"]', form);
    submitBtn.disabled = true;
    note.textContent = 'Sending...';

    // Simulate async submit
    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      note.textContent = 'Thanks! Your message has been sent.';
      setTimeout(() => note.textContent = '', 4000);
    }, 800);
  });

  /* --------------------------------
     Back to Top
  ----------------------------------*/
  const backToTop = $('#backToTop');
  function toggleBackToTop() {
    if (window.scrollY > window.innerHeight * 0.5) {
      backToTop.classList.add('back-to-top--visible');
    } else {
      backToTop.classList.remove('back-to-top--visible');
    }
  }
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();

  /* --------------------------------
     Footer year
  ----------------------------------*/
  $('#year').textContent = new Date().getFullYear();
})();