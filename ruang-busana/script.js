document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // ===== Mobile menu toggle =====
  if (toggle && navbar) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = navbar.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });

    links.forEach(l => l.addEventListener('click', () => {
      navbar.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navbar.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        navbar.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ===== Scroll spy =====
  const spy = () => {
    const y = window.pageYOffset;
    sections.forEach(s => {
      const top = s.offsetTop - 120;
      const h = s.offsetHeight;
      const id = s.id;
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (!link) return;
      if (y >= top && y < top + h) link.classList.add('active');
      else link.classList.remove('active');
    });
  };
  window.addEventListener('scroll', spy, { passive: true });

  // ===== Navbar shadow on scroll =====
  const shadowFn = () => {
    if (window.scrollY > 20) {
      navbar.style.boxShadow = '0 4px 12px rgba(26,26,26,.12)';
    } else {
      navbar.style.boxShadow = '0 4px 12px rgba(26,26,26,.08)';
    }
  };
  window.addEventListener('scroll', shadowFn, { passive: true });

  // ===== Fade-in on scroll =====
  const fades = document.querySelectorAll('.fade-in');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    fades.forEach(el => el.classList.add('appear'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('appear');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    fades.forEach(el => io.observe(el));
  }

  // ===== Category filter (vanilla JS — data-kategori toggle) =====
  const filterBtns = document.querySelectorAll('.filter-btn');
  const produkCards = document.querySelectorAll('.produk-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all filter buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      produkCards.forEach(card => {
        const kategori = card.getAttribute('data-kategori');

        if (filter === 'semua' || kategori === filter) {
          card.classList.remove('hide');
        } else {
          card.classList.add('hide');
        }
      });
    });
  });
});