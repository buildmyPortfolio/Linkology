/* ══════════════════════════════════════════════
   LINKOLOGY – Main JavaScript
   Interactions, animations, filtering, form
══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Theme Toggle ─── */
  const html = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('linkology-theme') || 'dark';

  // Apply saved theme immediately (before paint to avoid flash)
  if (savedTheme === 'light') html.setAttribute('data-theme', 'light');

  function toggleTheme() {
    const isLight = html.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('linkology-theme', next);

    // Spin animation on toggle
    themeBtn.animate(
      [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
      { duration: 500, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)' }
    );
  }

  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  /* ─── Custom Cursor ─── */
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover state on interactive elements
  const hoverEls = document.querySelectorAll('a, button, .service-card, .work-card, .filter-btn, input, select, textarea');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  /* ─── Navbar Scroll State ─── */
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 30);
    lastScroll = scrollY;
  }, { passive: true });

  /* ─── Mobile Menu ─── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function toggleMenu(open) {
    const isOpen = open ?? !mobileMenu.classList.contains('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMenu());
  mobileLinks.forEach(link => link.addEventListener('click', () => toggleMenu(false)));

  /* ─── Smooth Scroll (offset for fixed navbar) ─── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ─── Scroll Reveal ─── */
  const revealEls = document.querySelectorAll('.reveal-up');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger by index within parent
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal-up'));
        const delay = siblings.indexOf(entry.target) * 80;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ─── Counter Animation ─── */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }

  const counterEls = document.querySelectorAll('.stat-num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counterEls.forEach(el => counterObserver.observe(el));

  /* ─── Portfolio Filter ─── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      workCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const match = filter === 'all' || category === filter;

        if (match) {
          card.style.display = '';
          // Animate in
          card.animate(
            [{ opacity: 0, transform: 'scale(0.95)' }, { opacity: 1, transform: 'scale(1)' }],
            { duration: 300, easing: 'ease', fill: 'both' }
          );
        } else {
          card.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration: 200, easing: 'ease', fill: 'both' }
          ).onfinish = () => { card.style.display = 'none'; };
        }
      });
    });
  });

  /* ─── Lighthouse Bar Animation (About section) ─── */
  const barFills = document.querySelectorAll('.about-bar-fill');
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.transform = 'scaleX(1)';
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  barFills.forEach(b => barObserver.observe(b));

  /* ─── Tilt Cards (service & testimonial) ─── */
  function addTilt(selector) {
    document.querySelectorAll(selector).forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-4px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
  addTilt('.service-card');
  addTilt('.testimonial-card');

  /* ─── Contact Form ─── */
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const successMsg = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');

      // Simulate async submission
      submitBtn.disabled = true;
      btnText.hidden = true;
      btnSpinner.hidden = false;

      await new Promise(r => setTimeout(r, 1600));

      btnText.hidden = false;
      btnSpinner.hidden = true;
      submitBtn.disabled = false;

      form.reset();
      successMsg.hidden = false;

      setTimeout(() => {
        successMsg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, fill: 'both' })
          .onfinish = () => { successMsg.hidden = true; };
      }, 4000);
    });
  }

  /* ─── Active Nav Link on Scroll ─── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'active-nav-link',
            link.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => navObserver.observe(s));

  /* ─── Interactive Particle Constellation (Hero Canvas) ─── */
  const heroCanvas = document.getElementById('hero-canvas');
  const heroSection = document.getElementById('hero');
  const glow1 = document.querySelector('.hero-glow-1');
  const glow2 = document.querySelector('.hero-glow-2');

  if (heroCanvas && heroSection) {
    const ctx = heroCanvas.getContext('2d');
    let particleCount = 80;
    let connectionDist = 140;
    let particles = [];
    let heroMouse = { x: -9999, y: -9999, active: false };
    const mouseRadius = 180;
    const mouseForce = 0.04;

    function resizeCanvas() {
      const rect = heroSection.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      heroCanvas.width = rect.width * dpr;
      heroCanvas.height = rect.height * dpr;
      heroCanvas.style.width = rect.width + 'px';
      heroCanvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Adjust particle count for screen size
      particleCount = Math.floor((rect.width * rect.height) / 12000);
      particleCount = Math.max(40, Math.min(particleCount, 120));
      connectionDist = rect.width < 768 ? 100 : 140;
    }

    class Particle {
      constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2 + 0.8;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.baseSpeedX = this.speedX;
        this.baseSpeedY = this.speedY;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.008 + Math.random() * 0.012;
      }

      update(w, h, time) {
        // Organic drift with subtle sine wave
        this.x += this.speedX + Math.sin(time * 0.001 + this.pulseOffset) * 0.15;
        this.y += this.speedY + Math.cos(time * 0.001 + this.pulseOffset * 0.7) * 0.1;

        // Mouse attraction / repulsion
        if (heroMouse.active) {
          const dx = heroMouse.x - this.x;
          const dy = heroMouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRadius) {
            const force = (1 - dist / mouseRadius) * mouseForce;
            this.speedX += dx * force * 0.3;
            this.speedY += dy * force * 0.3;
          }
        }

        // Damping — return to base speed
        this.speedX += (this.baseSpeedX - this.speedX) * 0.02;
        this.speedY += (this.baseSpeedY - this.speedY) * 0.02;

        // Wrap around edges
        if (this.x < -10) this.x = w + 10;
        if (this.x > w + 10) this.x = -10;
        if (this.y < -10) this.y = h + 10;
        if (this.y > h + 10) this.y = -10;

        // Pulsing opacity
        this.currentOpacity = this.opacity + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.15;
      }

      draw(ctx, goldColor) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = goldColor.replace('ALPHA', this.currentOpacity.toFixed(2));
        ctx.fill();

        // Glow halo
        if (this.size > 1.5) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = goldColor.replace('ALPHA', (this.currentOpacity * 0.08).toFixed(3));
          ctx.fill();
        }
      }
    }

    function initParticles() {
      const rect = heroSection.getBoundingClientRect();
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(rect.width, rect.height));
      }
    }

    function getGoldColor() {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      return isLight ? 'rgba(142, 121, 62, ALPHA)' : 'rgba(200, 178, 115, ALPHA)';
    }

    function drawConnections(ctx, goldColor) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const opacity = (1 - dist / connectionDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = goldColor.replace('ALPHA', opacity.toFixed(3));
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw connections to mouse cursor
      if (heroMouse.active) {
        for (let i = 0; i < particles.length; i++) {
          const dx = heroMouse.x - particles[i].x;
          const dy = heroMouse.y - particles[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRadius) {
            const opacity = (1 - dist / mouseRadius) * 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(heroMouse.x, heroMouse.y);
            ctx.strokeStyle = goldColor.replace('ALPHA', opacity.toFixed(3));
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Mouse cursor glow
        const gradient = ctx.createRadialGradient(heroMouse.x, heroMouse.y, 0, heroMouse.x, heroMouse.y, 60);
        gradient.addColorStop(0, goldColor.replace('ALPHA', '0.12'));
        gradient.addColorStop(1, goldColor.replace('ALPHA', '0'));
        ctx.beginPath();
        ctx.arc(heroMouse.x, heroMouse.y, 60, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    function animate(time) {
      const rect = heroSection.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const goldColor = getGoldColor();

      particles.forEach(p => p.update(rect.width, rect.height, time));
      drawConnections(ctx, goldColor);
      particles.forEach(p => p.draw(ctx, goldColor));

      requestAnimationFrame(animate);
    }

    // Mouse tracking relative to hero section
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      heroMouse.x = e.clientX - rect.left;
      heroMouse.y = e.clientY - rect.top;
      heroMouse.active = true;

      // Also move the glows with mouse
      if (glow1 && glow2) {
        const { width, height } = rect;
        const x = (e.clientX / width - 0.5) * 30;
        const y = (e.clientY / height - 0.5) * 20;
        glow1.style.transform = `translate(${x * 0.8}px, ${y * 0.8}px) scale(1)`;
        glow2.style.transform = `translate(${-x * 0.6}px, ${-y * 0.6}px) scale(1)`;
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      heroMouse.active = false;
    });

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });

    resizeCanvas();
    initParticles();
    requestAnimationFrame(animate);
  }

  /* ─── Add active nav link style ─── */
  const style = document.createElement('style');
  style.textContent = `.active-nav-link { color: var(--accent) !important; }`;
  document.head.appendChild(style);

  /* ─── Hero Text Scramble Effect ─── */
  const heroTitleLine = document.querySelector('.hero-title-gold em');
  if (heroTitleLine) {
    const originalText = heroTitleLine.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let iteration = 0;
    function scramble() {
      heroTitleLine.textContent = originalText
        .split('')
        .map((char, index) => {
          if (index < iteration) return originalText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      if (iteration < originalText.length) {
        iteration += 1 / 2;
        requestAnimationFrame(scramble);
      } else {
        heroTitleLine.textContent = originalText;
      }
    }
    // Start scramble after a short delay
    setTimeout(scramble, 800);
  }

  /* ─── Portfolio Preview Modal ─── */
  const previewModal = document.getElementById('preview-modal');
  const previewBackdrop = document.getElementById('preview-modal-backdrop');
  const previewClose = document.getElementById('preview-modal-close');
  const previewIframe = document.getElementById('preview-iframe');
  const previewUrlText = document.getElementById('preview-modal-url');
  const previewExternal = document.getElementById('preview-modal-external');
  const previewLoader = document.getElementById('preview-modal-loader');

  function openPreview(url) {
    if (!previewModal || !previewIframe) return;

    // Set URL display and external link
    previewUrlText.textContent = url;
    previewExternal.href = url;

    // Show loader, reset iframe
    previewLoader.classList.remove('hidden');
    previewIframe.src = '';

    // Open modal
    previewModal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Load iframe
    requestAnimationFrame(() => {
      previewIframe.src = url;
    });

    // Hide loader when iframe loads
    previewIframe.onload = () => {
      previewLoader.classList.add('hidden');
    };
  }

  function closePreview() {
    if (!previewModal) return;
    previewModal.classList.remove('open');
    document.body.style.overflow = '';

    // Delay removing src so the transition finishes
    setTimeout(() => {
      previewIframe.src = '';
      previewLoader.classList.remove('hidden');
    }, 400);
  }

  // Event listeners for preview buttons
  document.querySelectorAll('[data-preview]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = btn.getAttribute('data-preview');
      if (url) openPreview(url);
    });
  });

  // Close modal
  if (previewClose) previewClose.addEventListener('click', closePreview);
  if (previewBackdrop) previewBackdrop.addEventListener('click', closePreview);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && previewModal?.classList.contains('open')) {
      closePreview();
    }
  });

})();
