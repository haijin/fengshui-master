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
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      // Simple success feedback
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.textContent = '发送成功！';
      btn.disabled = true;
      btn.style.background = '#28a745';
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.disabled = false;
        btn.style.background = '';
        contactForm.reset();
      }, 3000);
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
