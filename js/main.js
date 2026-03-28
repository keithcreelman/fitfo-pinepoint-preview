/* =============================================
   Pine Point Tree Service — Main JS
   Nav, mobile menu, scroll, before/after sliders
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMobileMenu();
  initBeforeAfterSliders();
  initBACarousel();
  initTimelineArrows();
  initVideo();
});

/* --- Smart Video: autoplay on desktop, lazy on mobile --- */
function initVideo() {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    video.preload = 'none';
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(video);
  } else {
    video.preload = 'auto';
    video.play().catch(() => {});
  }
}

/* --- Sticky Navigation --- */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  function updateNav() {
    if (window.scrollY > 80) {
      nav.classList.remove('nav--transparent');
      nav.classList.add('nav--solid');
    } else {
      nav.classList.remove('nav--solid');
      nav.classList.add('nav--transparent');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
}

/* --- Mobile Menu --- */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
}

function closeMobileNav() {
  const mobileNav = document.getElementById('mobileNav');
  const hamburger = document.getElementById('hamburger');
  if (mobileNav) mobileNav.classList.remove('active');
  if (hamburger) hamburger.classList.remove('active');
}

/* --- Before/After Sliders (drag + tap to toggle) --- */
function initBeforeAfterSliders() {
  document.querySelectorAll('.ba-slider').forEach(initSlider);
}

function initSlider(slider) {
  const afterImg = slider.querySelector('.ba-slider__after');
  const divider = slider.querySelector('.ba-slider__divider');
  const handle = slider.querySelector('.ba-slider__handle');
  if (!afterImg || !divider || !handle) return;

  let isDragging = false;
  let currentPercent = 50;

  function setPosition(percent) {
    percent = Math.max(2, Math.min(98, percent));
    currentPercent = percent;
    afterImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    divider.style.left = percent + '%';
    handle.style.left = percent + '%';
  }

  function setFromX(x) {
    const rect = slider.getBoundingClientRect();
    setPosition(((x - rect.left) / rect.width) * 100);
  }

  // Drag behavior
  function onStart(e) {
    isDragging = true;
    e.preventDefault();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setFromX(x);
  }

  function onMove(e) {
    if (!isDragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setFromX(x);
  }

  function onEnd() {
    isDragging = false;
  }

  slider.addEventListener('mousedown', onStart);
  slider.addEventListener('touchstart', onStart, { passive: false });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchend', onEnd);

  // Tap to toggle (mobile-friendly: tap left side = show before, right = show after)
  slider.addEventListener('click', function(e) {
    if (isDragging) return; // don't trigger on drag end
    const rect = slider.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = (clickX / rect.width) * 100;

    // If they tap near the current divider, toggle between 25% and 75%
    if (Math.abs(clickPercent - currentPercent) < 15) {
      setPosition(currentPercent < 50 ? 75 : 25);
    } else {
      setPosition(clickPercent);
    }
  });

  // Arrow buttons — mobile only (desktop uses drag/click, arrows add clutter)
  if (window.innerWidth <= 768) {
    const arrowLeft = document.createElement('button');
    arrowLeft.className = 'ba-arrow ba-arrow--left';
    arrowLeft.innerHTML = '&#9664;';
    arrowLeft.setAttribute('aria-label', 'Show before');
    arrowLeft.addEventListener('click', function(e) {
      e.stopPropagation();
      setPosition(Math.max(5, currentPercent - 25));
    });

    const arrowRight = document.createElement('button');
    arrowRight.className = 'ba-arrow ba-arrow--right';
    arrowRight.innerHTML = '&#9654;';
    arrowRight.setAttribute('aria-label', 'Show after');
    arrowRight.addEventListener('click', function(e) {
      e.stopPropagation();
      setPosition(Math.min(95, currentPercent + 25));
    });

    slider.appendChild(arrowLeft);
    slider.appendChild(arrowRight);
  }
}

/* --- Timeline Arrow Navigation --- */
function initTimelineArrows() {
  document.querySelectorAll('.timeline-scroll').forEach(function(scroll) {
    const wrapper = scroll.parentElement;

    // Create arrow buttons
    const leftBtn = document.createElement('button');
    leftBtn.className = 'timeline-arrow timeline-arrow--left';
    leftBtn.innerHTML = '&#9664;';
    leftBtn.setAttribute('aria-label', 'Scroll left');

    const rightBtn = document.createElement('button');
    rightBtn.className = 'timeline-arrow timeline-arrow--right';
    rightBtn.innerHTML = '&#9654;';
    rightBtn.setAttribute('aria-label', 'Scroll right');

    // Make wrapper position relative for arrow placement
    wrapper.style.position = 'relative';
    wrapper.appendChild(leftBtn);
    wrapper.appendChild(rightBtn);

    const scrollAmount = 280; // roughly one card width

    leftBtn.addEventListener('click', function() {
      scroll.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    rightBtn.addEventListener('click', function() {
      scroll.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Show/hide arrows based on scroll position
    function updateArrows() {
      leftBtn.style.display = scroll.scrollLeft > 10 ? 'flex' : 'none';
      rightBtn.style.display = scroll.scrollLeft < (scroll.scrollWidth - scroll.clientWidth - 10) ? 'flex' : 'none';
    }

    scroll.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();
    window.addEventListener('load', updateArrows);
  });
}

/* --- Before/After Carousel (mobile: one at a time) --- */
function initBACarousel() {
  const carousel = document.getElementById('baCarousel');
  if (!carousel) return;

  const sliders = carousel.querySelectorAll('.ba-slider');
  const counter = carousel.querySelector('.ba-carousel__counter');
  const prevBtn = carousel.querySelector('.ba-carousel__btn--prev');
  const nextBtn = carousel.querySelector('.ba-carousel__btn--next');
  if (!sliders.length || !counter || !prevBtn || !nextBtn) return;

  let current = 0;
  const total = sliders.length;
  const isMobile = window.innerWidth <= 768;

  function showSlide(index) {
    current = index;
    sliders.forEach((s, i) => {
      s.classList.toggle('ba-active', i === current);
    });
    counter.textContent = (current + 1) + ' / ' + total;
  }

  if (isMobile) {
    // Activate carousel: show first, hide rest
    showSlide(0);

    prevBtn.addEventListener('click', function() {
      showSlide(current > 0 ? current - 1 : total - 1);
    });

    nextBtn.addEventListener('click', function() {
      showSlide(current < total - 1 ? current + 1 : 0);
    });
  } else {
    // Desktop: show all, no carousel behavior needed
    sliders.forEach(s => s.classList.add('ba-active'));
  }
}
