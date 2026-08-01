'use strict';

/* ============================================================
   EMAN KUTHUB PORTFOLIO — MAIN SCRIPT (Light / Glass edition)
   Vanilla JS only. No external dependencies besides Font Awesome (CDN icons).
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     1. Footer year
  --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     2. Loading screen — hide once the page has fully loaded
  --------------------------------------------------------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => { loader && loader.classList.add('hidden'); }, 700);
  });
  // Safety fallback in case 'load' is delayed
  setTimeout(() => { loader && loader.classList.add('hidden'); }, 3000);

  /* ---------------------------------------------------------
     3. Navbar: scrolled state, active section highlight,
        back-to-top visibility — all driven by one scroll handler
  --------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id], .hero[id]');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    // Toggle the frosted-glass background once the user scrolls down
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    // Show/hide the back-to-top button
    if (backToTop) {
      if (window.scrollY > 600) backToTop.classList.add('show');
      else backToTop.classList.remove('show');
    }

    // Work out which section is currently in view and highlight its nav link
    let current = 'home';
    const scrollPos = window.scrollY + 140;
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop && backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------------------------------------------------------
     4. Mobile navigation toggle
  --------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navLinksWrap = document.getElementById('navLinks');

  navToggle && navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinksWrap.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', navLinksWrap.classList.contains('open'));
  });

  // Close the mobile menu whenever a link is tapped
  navLinksWrap && navLinksWrap.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinksWrap.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------------------------------------------------
     5. Typing animation for the roles list in the hero
  --------------------------------------------------------- */
  const roles = [
    'BCA Student',
    'Front-End Developer',
    'UI/UX Designer',
    'Aspiring Cybersecurity Professional'
  ];
  const typingEl = document.getElementById('typingText');

  if (typingEl) {
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const type = () => {
      const currentRole = roles[roleIndex];

      if (!deleting) {
        typingEl.textContent = currentRole.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex === currentRole.length) {
          deleting = true;
          setTimeout(type, 1500); // pause before deleting
          return;
        }
      } else {
        typingEl.textContent = currentRole.slice(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(type, deleting ? 35 : 70);
    };
    type();
  }

  /* ---------------------------------------------------------
     6. Scroll reveal animations (IntersectionObserver)
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), (i * 60) % 240);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------------------------------------------------
     7. Animated counter (About section "projects" stat)
  --------------------------------------------------------- */
  const counters = document.querySelectorAll('.about-float-stat .num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10) || 0;
      let current = 0;
      const duration = 1200;
      const stepTime = Math.max(30, duration / Math.max(target, 1));

      const step = () => {
        current++;
        el.textContent = current;
        if (current < target) setTimeout(step, stepTime);
        else el.textContent = target;
      };
      step();
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => counterObserver.observe(c));

  /* ---------------------------------------------------------
     8. Animated skill bars — fill to their target width
        once they scroll into view
  --------------------------------------------------------- */
  const skillFills = document.querySelectorAll('.skill-bar-fill');
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.width = el.dataset.width + '%';
        skillObserver.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  skillFills.forEach(f => skillObserver.observe(f));

  /* ---------------------------------------------------------
     9. Contact form — front-end only confirmation message
        (wire this up to a form backend/service before going live)
  --------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  contactForm && contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('fname').value.trim();

    formStatus.textContent = `Thanks${name ? ', ' + name : ''}! Your message has been noted — I'll reply soon.`;
    contactForm.reset();

    setTimeout(() => { formStatus.textContent = ''; }, 6000);
  });

  /* ---------------------------------------------------------
     10. Hero background — soft "connected nodes" canvas.
         Purely decorative and subtle; respects reduced motion.
  --------------------------------------------------------- */
  const canvas = document.getElementById('nodeCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w, h, nodes = [];

    const resize = () => {
      const hero = document.getElementById('home');
      w = canvas.width = hero.offsetWidth;
      h = canvas.height = hero.offsetHeight;
    };

    const initNodes = () => {
      const count = Math.min(36, Math.floor((w * h) / 42000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });

      // Draw connecting lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(37,99,235,${0.12 * (1 - dist / 150)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      // Draw the nodes themselves
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(124,58,237,0.35)';
        ctx.fill();
      });

      if (!prefersReducedMotion) requestAnimationFrame(draw);
    };

    resize();
    initNodes();
    draw();

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => { resize(); initNodes(); }, 250);
    });
  }

  /* ---------------------------------------------------------
     11. Smooth-scroll anchor links with sticky-nav offset
  --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = 78;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

});
