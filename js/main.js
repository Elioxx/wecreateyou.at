/* ============================================================
   WeCreateYou – KI-Automatisierung | Main JavaScript
   Navigation, Scroll Reveals, ROI Calculator, Counters,
   Cursor Glow, Typewriter, Floating CTA, Parallax
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveal();
  initTextReveal();
  initCounters();
  initROICalculator();
  initSmoothScroll();
  initServiceTabs();
  initCursorGlow();
  initTypewriter();
  initFloatingCTA();
  initHeroParallax();
});

/* ---------- Sticky Navigation ---------- */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const mobileNav = document.querySelector('.nav__mobile');
  const mobileLinks = document.querySelectorAll('.nav__mobile .nav__link');

  if (!nav) return;

  const scrollThreshold = 50;

  window.addEventListener('scroll', () => {
    if (window.scrollY > scrollThreshold) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }, { passive: true });

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('nav__toggle--active');
      mobileNav.classList.toggle('nav__mobile--active');
      document.body.style.overflow = mobileNav.classList.contains('nav__mobile--active') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('nav__toggle--active');
        mobileNav.classList.remove('nav__mobile--active');
        document.body.style.overflow = '';
      });
    });
  }
}

/* ---------- Scroll Reveal (Intersection Observer) ---------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ---------- Text Reveal (Staggered Line Animation) ---------- */
function initTextReveal() {
  const reveals = document.querySelectorAll('.text-reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('text-reveal--visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  reveals.forEach(el => observer.observe(el));
}

/* ---------- Animated Counters ---------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-count'), 10);
  const suffix = element.getAttribute('data-suffix') || '';
  const prefix = element.getAttribute('data-prefix') || '';
  const duration = 2000;
  const startTime = performance.now();

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const current = Math.round(target * easedProgress);
    element.textContent = prefix + current.toLocaleString('de-DE') + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

/* ---------- ROI Calculator ---------- */
function initROICalculator() {
  const employeeSlider = document.getElementById('roi-employees');
  const hoursSlider = document.getElementById('roi-hours');

  if (!employeeSlider || !hoursSlider) return;

  const employeeValue = document.getElementById('roi-employees-value');
  const hoursValue = document.getElementById('roi-hours-value');
  const savedHours = document.getElementById('roi-saved-hours');
  const savedCost = document.getElementById('roi-saved-cost');
  const savedPercent = document.getElementById('roi-saved-percent');

  function updateROI() {
    const employees = parseInt(employeeSlider.value, 10);
    const hours = parseInt(hoursSlider.value, 10);

    if (employeeValue) employeeValue.textContent = employees;
    if (hoursValue) hoursValue.textContent = hours;

    const automationRate = 0.4;
    const hourlyRate = 35;
    const totalAdminHours = employees * hours * 4;
    const savedHoursValue = Math.round(totalAdminHours * automationRate);
    const savedCostValue = Math.round(savedHoursValue * hourlyRate);
    const savedPercentValue = Math.round(automationRate * 100);

    if (savedHours) animateValue(savedHours, savedHoursValue, 'h/Monat');
    if (savedCost) animateValue(savedCost, savedCostValue, '€/Monat', '', true);
    if (savedPercent) savedPercent.textContent = savedPercentValue + '%';
  }

  function animateValue(element, target, suffix = '', prefix = '', currency = false) {
    const current = parseInt(element.textContent.replace(/[^\d]/g, ''), 10) || 0;
    const diff = target - current;
    const duration = 400;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(current + diff * progress);
      const formatted = currency ? value.toLocaleString('de-DE') : value;
      element.textContent = prefix + formatted + ' ' + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function updateSliderFill(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    const percent = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #6528F7 0%, #A855F7 ${percent}%, rgba(255,255,255,0.1) ${percent}%)`;
  }

  employeeSlider.addEventListener('input', () => { updateROI(); updateSliderFill(employeeSlider); });
  hoursSlider.addEventListener('input', () => { updateROI(); updateSliderFill(hoursSlider); });

  updateROI();
  updateSliderFill(employeeSlider);
  updateSliderFill(hoursSlider);
}

/* ---------- Smooth Scroll ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      e.preventDefault();
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 72;
      window.scrollTo({ top: targetEl.offsetTop - navHeight, behavior: 'smooth' });
    });
  });
}

/* ---------- Service Tabs ---------- */
function initServiceTabs() {
  const tabs = document.querySelectorAll('.services__tab');
  const panels = document.querySelectorAll('.services__panel');
  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('services__tab--active'));
      tab.classList.add('services__tab--active');
      panels.forEach(panel => {
        if (panel.getAttribute('data-panel') === target) {
          panel.style.display = 'grid';
          panel.style.animation = 'fadeInUp 0.5s var(--ease-out) forwards';
          // Re-trigger reveal on child cards
          panel.querySelectorAll('.reveal').forEach(el => {
            el.classList.remove('reveal--visible');
            setTimeout(() => el.classList.add('reveal--visible'), 50);
          });
        } else {
          panel.style.display = 'none';
        }
      });
    });
  });
}

/* ---------- Cursor Glow Effect ---------- */
function initCursorGlow() {
  if (window.innerWidth < 768) return;

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateGlow() {
    // Smooth lerp for buttery movement
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;
    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
}

/* ---------- Typewriter Effect on Hero ---------- */
function initTypewriter() {
  const el = document.getElementById('typewriter-target');
  if (!el) return;

  const words = ['automatisiert.', 'optimiert.', 'beschleunigt.', 'revolutioniert.'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const cursor = el.querySelector('.typewriter-cursor');

  function type() {
    const currentWord = words[wordIndex];
    const textEl = el.querySelector('.typewriter-text');
    if (!textEl) return;

    if (isDeleting) {
      textEl.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      textEl.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentWord.length) {
      speed = 2500; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = 400; // Pause before next word
    }

    setTimeout(type, speed);
  }

  // Start after a short delay
  setTimeout(type, 1200);
}

/* ---------- Floating CTA Button ---------- */
function initFloatingCTA() {
  const floatingCta = document.querySelector('.floating-cta');
  if (!floatingCta) return;

  const heroSection = document.querySelector('.hero');
  const contactSection = document.getElementById('kontakt');

  window.addEventListener('scroll', () => {
    const heroBottom = heroSection ? heroSection.getBoundingClientRect().bottom : 0;
    const contactTop = contactSection ? contactSection.getBoundingClientRect().top : Infinity;

    if (heroBottom < 0 && contactTop > window.innerHeight) {
      floatingCta.classList.add('floating-cta--visible');
    } else {
      floatingCta.classList.remove('floating-cta--visible');
    }
  }, { passive: true });
}

/* ---------- Hero Parallax on Mouse ---------- */
function initHeroParallax() {
  if (window.innerWidth < 768) return;

  const hero = document.querySelector('.hero');
  const orbs = document.querySelectorAll('.hero__orb');
  if (!hero || !orbs.length) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    orbs.forEach((orb, i) => {
      const speed = (i + 1) * 15;
      orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
  });
}

/* ---------- Contact Form ---------- */
document.addEventListener('submit', (e) => {
  if (!e.target.classList.contains('contact-form')) return;
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector('.contact-form__submit');
  const note = form.querySelector('#contact-form-note');
  const originalHTML = btn.innerHTML;
  const originalNoteHTML = note ? note.innerHTML : '';

  btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;">⏳ Wird gesendet...</span>';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  fetch('contact.php', {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' },
  })
    .then((response) => response.json().catch(() => ({ ok: false, error: 'Unerwartete Antwort vom Server.' })))
    .then((data) => {
      if (!data.ok) throw new Error(data.error || 'Die Nachricht konnte nicht gesendet werden.');

      btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;">✓ Nachricht gesendet!</span>';
      btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
      btn.style.opacity = '1';

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
        if (note) note.innerHTML = originalNoteHTML;
      }, 3000);
    })
    .catch((err) => {
      btn.innerHTML = originalHTML;
      btn.style.opacity = '1';
      btn.disabled = false;
      if (note) {
        note.innerHTML = '⚠️ ' + (err.message || 'Die Nachricht konnte nicht gesendet werden. Bitte schreib uns direkt an office@wecreateyou.at.');
      }
    });
});
