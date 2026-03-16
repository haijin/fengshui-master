/* ===================================================
   FENGSHUI MASTER — Main JavaScript
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- AOS Animate On Scroll ---------- */
  AOS.init({
    duration: 700,
    easing: 'ease-in-out',
    once: true,
    offset: 60
  });

  /* ---------- Sticky Header Shadow ---------- */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });

  /* ---------- Active Nav Link on Scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  function setActiveLink() {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 140) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', setActiveLink);

  /* ---------- Back to Top ---------- */
  const btt = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 400);
  });

  /* ---------- Swiper — Testimonials ---------- */
  new Swiper('.testimonials-swiper', {
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    slidesPerView: 1,
    spaceBetween: 24,
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });

  /* ---------- Portfolio Filter ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      portfolioItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        if (match) {
          item.style.display = '';
          // Re-trigger AOS
          setTimeout(() => item.classList.remove('hidden'), 10);
        } else {
          item.classList.add('hidden');
          setTimeout(() => { item.style.display = 'none'; }, 400);
        }
      });
    });
  });

  /* ---------- Contact Form Submit ---------- */
  const RECAPTCHA_SITE_KEY = '6Lf0GYssAAAAANXgHdRXo8SATOZiRsbgR4sP4ckW';

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '验证中…';

      try {
        const recaptchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'contact' });

        btn.textContent = '发送中…';

        const data = {
          name:            contactForm.querySelector('[name="name"]').value.trim(),
          email:           contactForm.querySelector('[name="email"]').value.trim(),
          phone:           contactForm.querySelector('[name="phone"]').value.trim(),
          service:         contactForm.querySelector('[name="service"]').value,
          message:         contactForm.querySelector('[name="message"]').value.trim(),
          recaptcha_token: recaptchaToken,
        };

        const res = await fetch('/api/submit-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());

        btn.textContent = '发送成功！';
        btn.style.background = '#28a745';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.background = '';
          contactForm.reset();
        }, 3000);
      } catch (err) {
        console.error('Contact form error:', err);
        btn.textContent = '发送失败，请重试';
        btn.style.background = '#dc3545';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.background = '';
        }, 3000);
      }
    });
  }

  /* ---------- Smooth close mobile nav on link click ---------- */
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const collapse = document.getElementById('navbarNav');
      if (collapse.classList.contains('show')) {
        new bootstrap.Collapse(collapse).hide();
      }
    });
  });

});
