const intro = document.querySelector('.intro');

let smoothScrollFrame = 0;
let smoothScrollTarget = window.scrollY;
let savedScrollBehavior = '';
window.addEventListener('wheel', (event) => {
  if (event.ctrlKey || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  const scale = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 18 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? window.innerHeight : 1;
  const delta = event.deltaY * scale;
  const maxScroll = root.scrollHeight - window.innerHeight;
  const nextTarget = Math.max(0, Math.min(maxScroll, smoothScrollTarget + delta));
  if (nextTarget === smoothScrollTarget && !smoothScrollFrame) return;
  event.preventDefault();
  smoothScrollTarget = nextTarget;
  if (smoothScrollFrame) return;

  savedScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  const glide = () => {
    const distance = smoothScrollTarget - window.scrollY;
    if (Math.abs(distance) < 0.8) {
      window.scrollTo(0, smoothScrollTarget);
      smoothScrollFrame = 0;
      root.style.scrollBehavior = savedScrollBehavior;
      return;
    }
    window.scrollTo(0, window.scrollY + distance * 0.115);
    smoothScrollFrame = requestAnimationFrame(glide);
  };
  smoothScrollFrame = requestAnimationFrame(glide);
}, { passive: false });
const stopSmoothWheelScroll = () => {
  if (!smoothScrollFrame) {
    smoothScrollTarget = window.scrollY;
    return;
  }
  cancelAnimationFrame(smoothScrollFrame);
  smoothScrollFrame = 0;
  document.documentElement.style.scrollBehavior = savedScrollBehavior;
  smoothScrollTarget = window.scrollY;
};
window.addEventListener('scroll', () => {
  if (!smoothScrollFrame) smoothScrollTarget = window.scrollY;
}, { passive: true });
window.addEventListener('pointerdown', stopSmoothWheelScroll, { passive: true });
window.addEventListener('touchstart', stopSmoothWheelScroll, { passive: true });
window.addEventListener('keydown', (event) => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) stopSmoothWheelScroll();
}, { passive: true });

const introReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealPortfolio = () => {
  intro.classList.add('opening');
  setTimeout(() => {
    intro.classList.add('done');
    intro.setAttribute('aria-hidden', 'true');
    document.querySelectorAll('.hero .reveal').forEach((item, i) => setTimeout(() => item.classList.add('visible'), 120 + i * 130));
  }, introReducedMotion ? 40 : 1120);
};
setTimeout(revealPortfolio, introReducedMotion ? 120 : 1900);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal:not(.hero .reveal)').forEach((item, index) => {
  item.style.setProperty('--delay', `${(index % 4) * 80}ms`);
  revealObserver.observe(item);
});

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav');
toggle.addEventListener('click', () => {
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  nav.classList.toggle('open', !isOpen);
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
  nav.classList.remove('open');
}));

const videoGallery = document.querySelector('.video-gallery');
const videoGalleryTriggers = document.querySelectorAll('[data-video-gallery]');
const closeVideoGallery = () => {
  videoGallery.querySelectorAll('video').forEach((video) => {
    video.pause();
    video.currentTime = 0;
  });
  videoGallery.close();
};
videoGalleryTriggers.forEach((trigger) => trigger.addEventListener('click', () => videoGallery.showModal()));
videoGallery.querySelector('.video-gallery-close').addEventListener('click', closeVideoGallery);
videoGallery.addEventListener('click', (event) => {
  if (event.target === videoGallery) closeVideoGallery();
});
videoGallery.addEventListener('close', () => {
  videoGallery.querySelectorAll('video').forEach((video) => video.pause());
});

const spiderCorner = document.querySelector('.spider-corner');
const spiderPull = document.querySelector('.spider-pull');
const spiderDrawer = document.querySelector('.spider-drawer');
let spiderPointerStart = null;
let spiderDragged = false;
let spiderPosition = { x: 0, y: 0 };
const setSpiderMenu = (open) => {
  spiderCorner.classList.toggle('is-open', open);
  spiderPull.setAttribute('aria-expanded', String(open));
  spiderPull.setAttribute('aria-label', open ? 'Close the Spider-Man menu' : 'Drag Spider-Man to move it or open the menu');
  spiderDrawer.setAttribute('aria-hidden', String(!open));
};
const updateSpiderPosition = (x, y, tilt = 0) => {
  const origin = spiderCorner.getBoundingClientRect();
  const maxX = Math.max(-origin.left, window.innerWidth - origin.left - spiderPull.offsetWidth);
  const maxY = Math.max(-origin.top, window.innerHeight - origin.top - spiderPull.offsetHeight);
  spiderPosition = { x: Math.max(-origin.left, Math.min(maxX, x)), y: Math.max(-origin.top, Math.min(maxY, y)) };
  spiderPull.style.setProperty('--spider-x', `${spiderPosition.x}px`);
  spiderPull.style.setProperty('--spider-y', `${spiderPosition.y}px`);
  spiderPull.style.setProperty('--spider-tilt', `${tilt}deg`);
  const threadStart = window.matchMedia('(max-width: 640px)').matches ? 75 : 92;
  const threadX = spiderPosition.x;
  const threadY = spiderPosition.y + threadStart;
  spiderCorner.style.setProperty('--spider-thread-length', `${Math.hypot(threadX, threadY)}px`);
  spiderCorner.style.setProperty('--spider-thread-angle', `${-Math.atan2(threadX, threadY) * 180 / Math.PI}deg`);
};
spiderPull.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 && event.pointerType === 'mouse') return;
  spiderPointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: spiderPosition.x, startY: spiderPosition.y };
  spiderDragged = false;
  spiderPull.setPointerCapture(event.pointerId);
});
spiderPull.addEventListener('pointermove', (event) => {
  if (!spiderPointerStart || spiderPointerStart.id !== event.pointerId) return;
  const dx = event.clientX - spiderPointerStart.x;
  const dy = event.clientY - spiderPointerStart.y;
  if (Math.hypot(dx, dy) > 5) {
    spiderDragged = true;
    spiderCorner.classList.add('is-dragging');
  }
  const tilt = Math.max(-16, Math.min(16, dx * 0.12));
  updateSpiderPosition(spiderPointerStart.startX + dx, spiderPointerStart.startY + dy, tilt);
});
const finishSpiderPull = (event) => {
  if (!spiderPointerStart || spiderPointerStart.id !== event.pointerId) return;
  const dy = event.clientY - spiderPointerStart.y;
  spiderPointerStart = null;
  spiderCorner.classList.remove('is-dragging');
  updateSpiderPosition(0, 0);
  if (spiderDragged && dy > 26) setSpiderMenu(true);
  if (event.type === 'pointercancel') setTimeout(() => { spiderDragged = false; }, 0);
};
spiderPull.addEventListener('pointerup', finishSpiderPull);
spiderPull.addEventListener('pointercancel', finishSpiderPull);
window.addEventListener('resize', () => updateSpiderPosition(spiderPosition.x, spiderPosition.y));
spiderPull.addEventListener('click', (event) => {
  if (spiderDragged) {
    event.preventDefault();
    spiderDragged = false;
    return;
  }
  setSpiderMenu(spiderPull.getAttribute('aria-expanded') !== 'true');
});
spiderPull.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' || event.key === ' ') {
    event.preventDefault();
    setSpiderMenu(true);
  } else if (event.key === 'Escape') setSpiderMenu(false);
});
spiderDrawer.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setSpiderMenu(false)));
document.addEventListener('pointerdown', (event) => {
  if (!spiderCorner.contains(event.target)) setSpiderMenu(false);
});

document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => {
  document.querySelector('.filter.active')?.classList.remove('active');
  button.classList.add('active');
  const category = button.dataset.filter;
  document.querySelectorAll('.project-card, .reel-showcase').forEach((card) => {
    const show = category === 'all' || card.dataset.category === category;
    card.classList.toggle('hidden', !show);
  });
}));

const reelRail = document.querySelector('#selected-reels');
const reelScrollButtons = document.querySelectorAll('[data-reel-scroll]');
const reelShowcase = document.querySelector('.reel-showcase');
let reelAutoTimer;
let reelIsVisible = false;
let reelIsPaused = false;
let reelLocked = false;
let activeReelIndex = 0;
let playingReelIndex = -1;
const reelCards = [...reelRail.querySelectorAll('.reel-card')];
const reelMotionReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const reelToggleButton = document.querySelector('[data-reel-toggle]');
const updateReelToggle = () => {
  reelToggleButton.textContent = reelLocked ? '↻' : 'Ⅱ';
  reelToggleButton.setAttribute('aria-label', reelLocked ? 'Resume automatic video shuffle' : 'Pause automatic video shuffle');
  reelToggleButton.title = reelLocked ? 'Resume automatic shuffle' : 'Pause automatic shuffle';
};
const syncReelPlayback = () => {
  reelCards.forEach((card, index) => {
    const video = card.querySelector('video');
    if (index === activeReelIndex && reelIsVisible && !document.hidden) {
      if (playingReelIndex !== index) video.muted = true;
      playingReelIndex = index;
      video.loop = true;
      video.play().catch(() => {});
    } else {
      video.pause();
      video.muted = true;
    }
  });
  if (!reelIsVisible || document.hidden) playingReelIndex = -1;
};
const paintReelArc = () => {
  const count = reelCards.length;
  const styles = getComputedStyle(reelRail);
  const step = Number.parseFloat(styles.getPropertyValue('--reel-step')) || 150;
  reelCards.forEach((card, index) => {
    let slot = index - activeReelIndex;
    if (slot > count / 2) slot -= count;
    if (slot < -count / 2) slot += count;
    const distance = Math.abs(slot);
    const x = slot * step;
    const y = distance * distance * (window.innerWidth <= 640 ? 6 : 9);
    const angle = slot * -7;
    const scale = Math.max(.68, 1 - distance * .075);
    card.style.transform = `translate(calc(-50% + ${x}px), ${y}px) rotate(${angle}deg) scale(${scale})`;
    card.style.zIndex = String(count - distance);
    card.classList.toggle('is-active', index === activeReelIndex);
    card.setAttribute('aria-current', String(index === activeReelIndex));
  });
  reelRail.classList.toggle('is-locked', reelLocked);
  updateReelToggle();
  syncReelPlayback();
};
const selectReel = (index) => {
  activeReelIndex = (index + reelCards.length) % reelCards.length;
  paintReelArc();
};
const moveReelsForward = () => {
  if (!reelIsVisible || reelIsPaused || reelLocked || document.hidden || reelMotionReduced.matches) return;
  selectReel(activeReelIndex + 1);
};
const scheduleReelAdvance = () => {
  clearTimeout(reelAutoTimer);
  if (!reelLocked && !reelMotionReduced.matches) reelAutoTimer = setTimeout(() => {
    moveReelsForward();
    scheduleReelAdvance();
  }, 1500);
};
const restoreReelCarousel = () => {
  reelLocked = false;
  reelIsPaused = false;
  const activeVideo = reelCards[activeReelIndex]?.querySelector('video');
  if (activeVideo) activeVideo.muted = true;
  paintReelArc();
  scheduleReelAdvance();
};
reelScrollButtons.forEach((button) => button.addEventListener('click', () => {
  if (button === reelToggleButton) return;
  selectReel(activeReelIndex + Number(button.dataset.reelScroll));
  scheduleReelAdvance();
}));
reelToggleButton.addEventListener('click', () => {
  reelLocked = !reelLocked;
  paintReelArc();
  scheduleReelAdvance();
});
reelCards.forEach((card, index) => card.addEventListener('click', () => {
  if (!reelLocked || index !== activeReelIndex) {
    reelLocked = true;
    if (index !== activeReelIndex) selectReel(index);
    else {
      reelRail.classList.add('is-locked');
      updateReelToggle();
    }
    scheduleReelAdvance();
  }
}));
window.addEventListener('resize', paintReelArc, { passive: true });
reelShowcase.addEventListener('pointerdown', () => { reelIsPaused = true; clearTimeout(reelAutoTimer); });
reelShowcase.addEventListener('pointerup', () => { reelIsPaused = false; scheduleReelAdvance(); });
reelShowcase.addEventListener('focusin', () => { reelIsPaused = true; clearTimeout(reelAutoTimer); });
reelShowcase.addEventListener('focusout', (event) => {
  if (!reelShowcase.contains(event.relatedTarget)) { reelIsPaused = false; scheduleReelAdvance(); }
});
reelShowcase.addEventListener('touchstart', () => { reelIsPaused = true; clearTimeout(reelAutoTimer); }, { passive: true });
reelShowcase.addEventListener('touchend', () => { reelIsPaused = false; scheduleReelAdvance(); }, { passive: true });
let reelTouchStartX = 0;
reelRail.addEventListener('touchstart', (event) => { reelTouchStartX = event.changedTouches[0].clientX; }, { passive: true });
reelRail.addEventListener('touchend', (event) => {
  const delta = event.changedTouches[0].clientX - reelTouchStartX;
  if (Math.abs(delta) > 35) selectReel(activeReelIndex + (delta < 0 ? 1 : -1));
  scheduleReelAdvance();
}, { passive: true });
reelCards.forEach((card, index) => {
  const video = card.querySelector('video');
  video.addEventListener('volumechange', () => {
    if (index !== activeReelIndex) return;
    reelIsPaused = !video.muted;
    if (reelIsPaused) clearTimeout(reelAutoTimer);
    else scheduleReelAdvance();
  });
  video.addEventListener('webkitbeginfullscreen', () => { reelIsPaused = true; clearTimeout(reelAutoTimer); });
  video.addEventListener('webkitendfullscreen', restoreReelCarousel);
});
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    restoreReelCarousel();
    return;
  }
  reelIsPaused = true;
  clearTimeout(reelAutoTimer);
});
let reelWasHidden = false;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    reelWasHidden = true;
    syncReelPlayback();
    return;
  }
  if (reelWasHidden && reelLocked) restoreReelCarousel();
  else { syncReelPlayback(); scheduleReelAdvance(); }
  reelWasHidden = false;
});
window.addEventListener('pageshow', () => { if (reelLocked) restoreReelCarousel(); });
reelMotionReduced.addEventListener?.('change', scheduleReelAdvance);
new IntersectionObserver(([entry]) => {
  reelIsVisible = entry.isIntersecting;
  syncReelPlayback();
  scheduleReelAdvance();
}, { threshold: 0.15 }).observe(reelShowcase);
paintReelArc();

document.querySelector('#year').textContent = new Date().getFullYear();

const themeButtons = document.querySelectorAll('.theme-swatch');
const savedTheme = localStorage.getItem('portfolio-theme') || 'green';
document.body.dataset.theme = savedTheme;
document.body.classList.add('theme-ready');
const themeTransition = document.querySelector('.theme-transition');
let themeTransitionTimers = [];
const changeTheme = (selected, button) => {
  const previousTheme = document.body.dataset.theme;
  themeTransitionTimers.forEach(clearTimeout);
  themeTransitionTimers = [];
  themeTransition.className = 'theme-transition';
  themeButtons.forEach((swatch) => swatch.setAttribute('aria-pressed', String(swatch === button)));
  localStorage.setItem('portfolio-theme', selected);
  if (previousTheme === selected) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.dataset.theme = selected;
    return;
  }

  const themeWaves = { red: '#f06459', purple: '#9366bf', green: '#99c77d', blue: '#73b9eb' };
  themeTransition.style.setProperty('--wave-color', themeWaves[selected]);
  document.body.dataset.theme = selected;
  themeTransition.classList.add('color-wave');
  themeTransitionTimers.push(setTimeout(() => { themeTransition.className = 'theme-transition'; }, 1600));
};
themeButtons.forEach((button) => {
  button.setAttribute('aria-pressed', String(button.dataset.theme === savedTheme));
  button.addEventListener('click', () => changeTheme(button.dataset.theme, button));
});

const trailCanvas = document.querySelector('.cursor-trail');
const trailContext = trailCanvas.getContext('2d');
const cursorBall = document.querySelector('.cursor-ball');
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let trailPoints = [];
  let trailFrame = 0;
  let lastMoveAt = 0;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const canAnimateTrail = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const resizeTrail = () => {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    trailCanvas.width = Math.round(window.innerWidth * pixelRatio);
    trailCanvas.height = Math.round(window.innerHeight * pixelRatio);
    trailCanvas.style.width = `${window.innerWidth}px`;
    trailCanvas.style.height = `${window.innerHeight}px`;
    trailContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };
  resizeTrail();
  window.addEventListener('resize', resizeTrail, { passive: true });

  const readThemeColor = () => getComputedStyle(document.body).getPropertyValue('--lime').trim();
  const colorToRgba = (color, alpha) => {
    const rgb = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgb) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${alpha})`;
    const hex = color.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
    if (!hex) return `rgba(120, 190, 210, ${alpha})`;
    const full = hex.length === 3 ? hex.split('').map((digit) => digit + digit).join('') : hex;
    const value = Number.parseInt(full, 16);
    return `rgba(${value >> 16}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
  };

  const drawTrail = (now) => {
    trailContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    trailPoints = trailPoints.filter((point) => now - point.time < 560);
    const stillMoving = now - lastMoveAt;
    const idleFade = Math.max(0, 1 - stillMoving / 460);

    if (canAnimateTrail && trailPoints.length > 1 && idleFade > 0) {
      const sampled = trailPoints.map((point, index) => {
        const before = trailPoints[Math.max(0, index - 1)];
        const after = trailPoints[Math.min(trailPoints.length - 1, index + 1)];
        const dx = after.x - before.x;
        const dy = after.y - before.y;
        const length = Math.hypot(dx, dy) || 1;
        const wave = Math.sin(now * 0.008 - index * 0.38) * 2.4;
        return { x: point.x - (dy / length) * wave, y: point.y + (dx / length) * wave };
      });
      const first = sampled[0];
      const last = sampled[sampled.length - 1];
      const themeColor = readThemeColor();
      const gradient = trailContext.createLinearGradient(first.x, first.y, last.x, last.y);
      gradient.addColorStop(0, colorToRgba(themeColor, 0.02));
      gradient.addColorStop(0.55, colorToRgba(themeColor, 0.52 * idleFade));
      gradient.addColorStop(1, colorToRgba(themeColor, 0.96 * idleFade));

      trailContext.beginPath();
      trailContext.moveTo(first.x, first.y);
      for (let index = 1; index < sampled.length - 1; index++) {
        const midpointX = (sampled[index].x + sampled[index + 1].x) / 2;
        const midpointY = (sampled[index].y + sampled[index + 1].y) / 2;
        trailContext.quadraticCurveTo(sampled[index].x, sampled[index].y, midpointX, midpointY);
      }
      trailContext.lineTo(last.x, last.y);
      trailContext.lineCap = 'round';
      trailContext.lineJoin = 'round';
      trailContext.globalAlpha = idleFade;
      trailContext.strokeStyle = colorToRgba(themeColor, 0.24);
      trailContext.lineWidth = 6;
      trailContext.shadowColor = colorToRgba(themeColor, 0.38);
      trailContext.shadowBlur = 11;
      trailContext.stroke();
      trailContext.shadowBlur = 0;
      trailContext.strokeStyle = gradient;
      trailContext.lineWidth = 1.8;
      trailContext.stroke();
      trailContext.globalAlpha = 1;
    }

    if (trailPoints.length > 1 && idleFade > 0) trailFrame = requestAnimationFrame(drawTrail);
    else if (idleFade <= 0) {
      trailContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
      trailPoints = [];
      trailFrame = 0;
    } else {
      trailFrame = 0;
    }
  };

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const now = performance.now();
    cursorBall.style.setProperty('--cursor-x', `${event.clientX}px`);
    cursorBall.style.setProperty('--cursor-y', `${event.clientY}px`);
    cursorBall.classList.add('on');
    document.body.classList.add('cursor-active');
    cursorBall.classList.toggle('hovering', Boolean(event.target.closest('a, button, [role="button"], input, select, textarea')));

    if (canAnimateTrail && now - lastMoveAt > 460) trailPoints = [];
    const previous = trailPoints[trailPoints.length - 1];
    if (!previous || Math.hypot(event.clientX - previous.x, event.clientY - previous.y) > 1.5) {
      trailPoints.push({ x: event.clientX, y: event.clientY, time: now });
      if (trailPoints.length > 54) trailPoints.shift();
    }
    lastMoveAt = now;
    if (canAnimateTrail && !trailFrame) trailFrame = requestAnimationFrame(drawTrail);
  }, { passive: true });
  window.addEventListener('pointerleave', () => {
    cursorBall.classList.remove('on', 'hovering');
    document.body.classList.remove('cursor-active');
    lastMoveAt = performance.now() - 460;
    if (canAnimateTrail && !trailFrame && trailPoints.length > 1) trailFrame = requestAnimationFrame(drawTrail);
  }, { passive: true });
}
