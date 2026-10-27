// ======================================================
// m00n-phases - renderer
// ======================================================

const body = document.body;

// -- DOM elements --
const moonElement = document.getElementById('moon');
const moonNameElement = document.getElementById('moon-name');
const moonDateElement = document.getElementById('moon-date');
const moonDescElement = document.getElementById('moon-desc');
const weekScreenElement = document.getElementById('week-screen');
const exitButtonElement = document.getElementById('exit-btn');
const minimizeButtonElement = document.getElementById('minimize-btn');
const weeklyMoonsButtonElement = document.getElementById('weeklymoons-btn');
const sparkleCanvas = document.getElementById('sparkle-canvas');
const sparkleCtx = sparkleCanvas.getContext('2d');

// -- Constants --
const NIGHT_START_HOUR = 18; // night: 18:00 - 05:59
const NIGHT_END_HOUR = 6;
const STAR_TWINKLE_MS = 800;
const WEEK_DAYS = 7;
const PHASE_COUNT = 8;
const SPARKLE_LIFETIME = 1000; // ms
const SPARKLE_INTERVAL = 30;   // ms between sparkles

// Left position of each day slot, matching UI-week.png
const WEEK_SLOT_POSITIONS = [3.9, 18.0, 32.0, 46.1, 59.8, 74.2, 88.3];

// -- Moon phase data --
// Order matches the frames in moon-phases.png
const PHASES = [
  {
    key: 'New Moon',
    name: 'New Moon',
    desc: 'Hidden with Selene in the darkest sky, this phase was said to hold the power of new beginnings, inviting quiet reflection before anything is set in motion.'
  },
  {
    key: 'Waxing Crescent',
    name: 'Waxing Crescent',
    desc: 'Diana\'s young light was believed to fuel the first spark of growth and courage, urging seeds planted in darkness to finally reach toward the sun.'
  },
  {
    key: 'First Quarter',
    name: 'First Quarter',
    desc: 'The half-lit moon carried the strength to push through obstacles, a turning point said to demand decisive action and the will to keep moving forward.'
  },
  {
    key: 'Waxing Gibbous',
    name: 'Waxing Gibbous',
    desc: 'Selene\'s chariot grew ever brighter across the heavens, said to sharpen focus and patience in the final stretch before the moon\'s light peaks.'
  },
  {
    key: 'Full Moon',
    name: 'Full Moon',
    desc: 'Luna rode the night sky at her fullest, granting clarity, power, and revelation, a moment the ancients believed could illuminate truths kept hidden by daylight.'
  },
  {
    key: 'Waning Gibbous',
    name: 'Waning Gibbous',
    desc: 'Hecate\'s fading light was thought to bring gratitude and quiet release, a gentle call to honor what has been accomplished before letting it go.'
  },
  {
    key: 'Last Quarter',
    name: 'Last Quarter',
    desc: 'The half-dark moon held the strength to let go and forgive old wounds, said to clear space within the spirit for whatever comes next.'
  },
  {
    key: 'Waning Crescent',
    name: 'Waning Crescent',
    desc: 'Hecate\'s last sliver offered rest, surrender, and quiet inner wisdom, guiding the soul gently back toward the stillness of the dark moon.'
  }
];

// -- Day/night helpers --
function isNight(hour) {
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

// Between midnight and 06:00 it is still "last night"
function getTonightDate(now) {
  const d = new Date(now);
  const isPastMidnight = d.getHours() < NIGHT_END_HOUR;

  if (isPastMidnight) {
    d.setDate(d.getDate() - 1);
  }

  return d;
}

// YYYY-MM-DD using the LOCAL date (toISOString would use UTC)
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// -- Moon phase helpers --
function getPhaseIndex(apiKey) {
  const index = PHASES.findIndex((phase) => phase.key === apiKey);

  if (index === -1) {
    return 0;
  }

  return index;
}

// Shows the right frame of the sprite sheet, in whole pixels,
// and keeps it correct when the element is resized
function setMoonPhaseSprite(element, phaseIndex) {
  const applySprite = () => {
    const elementWidth = Math.round(element.getBoundingClientRect().width);

    if (elementWidth === 0) {
      return;
    }

    element.style.backgroundSize = `${elementWidth * PHASE_COUNT}px ${elementWidth}px`;
    element.style.backgroundPosition = `-${phaseIndex * elementWidth}px 0px`;
  };

  applySprite();

  const resizeObserver = new ResizeObserver(applySprite);
  resizeObserver.observe(element);
}

// -- Background (day/night switch) --
function updateBackground() {
  const hour = new Date().getHours();

  body.classList.remove('day', 'night', 'frame-b');

  if (isNight(hour)) {
    body.classList.add('night');
  } else {
    body.classList.add('day');
  }
}

// Swaps the 2 night frames to make the stars twinkle
function startStarTwinkle() {
  if (!isNight(new Date().getHours())) {
    return;
  }

  setInterval(() => body.classList.toggle('frame-b'), STAR_TWINKLE_MS);
}

// -- Main screen: tonight's moon --
async function loadMoon() {
  if (!isNight(new Date().getHours())) {
    return;
  }

  const tonight = getTonightDate(new Date());

  try {
    const phaseKey = await window.api.getMoonPhase(formatDate(tonight));
    const phaseIndex = getPhaseIndex(phaseKey);
    const phase = PHASES[phaseIndex];

    setMoonPhaseSprite(moonElement, phaseIndex);

    moonNameElement.textContent = phase.name;
    moonDateElement.textContent = tonight.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    moonDescElement.textContent = phase.desc;
  } catch (error) {
    moonNameElement.textContent = 'No connection';
    moonDateElement.textContent = '';
    moonDescElement.textContent = 'Could not reach the moon phase API.';
  }
}

// -- Week screen: description height --
// Each description fills the space down to the bottom of the card
function fitWeekDescriptions() {
  const bottomMargin = 24; // keeps the text clear of the frame border

  document.querySelectorAll('.week-day-desc').forEach((descElement) => {
    const top = descElement.getBoundingClientRect().top;
    const available = window.innerHeight - top - bottomMargin;

    descElement.style.maxHeight = `${Math.max(available, 0)}px`;
  });
}

window.addEventListener('resize', fitWeekDescriptions);

// -- Week screen: next 7 moons --
async function loadWeekScreen() {
  weekScreenElement.innerHTML = '';

  const anchorDate = getTonightDate(new Date());

  for (let dayOffset = 0; dayOffset < WEEK_DAYS; dayOffset++) {
    const date = new Date(anchorDate);
    date.setDate(date.getDate() + dayOffset);

    const dayElement = document.createElement('div');
    dayElement.className = 'week-day';
    dayElement.style.left = WEEK_SLOT_POSITIONS[dayOffset] + '%';

    const labelElement = document.createElement('span');
    labelElement.className = 'week-day-label';
    labelElement.textContent = date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'numeric'
    });

    const phaseNameElement = document.createElement('span');
    phaseNameElement.className = 'week-day-phase';

    const phaseDescElement = document.createElement('span');
    phaseDescElement.className = 'week-day-desc';

    try {
      const phaseKey = await window.api.getMoonPhase(formatDate(date));
      const phaseIndex = getPhaseIndex(phaseKey);
      const phase = PHASES[phaseIndex];

      phaseNameElement.textContent = phase.name;
      phaseDescElement.textContent = phase.desc;

      dayElement.appendChild(labelElement);
      dayElement.appendChild(phaseNameElement);
      dayElement.appendChild(phaseDescElement);
      weekScreenElement.appendChild(dayElement);

      // Needs the element in the page, to measure its real size
      setMoonPhaseSprite(dayElement, phaseIndex);
    } catch (error) {
      phaseNameElement.textContent = 'No connection';

      dayElement.appendChild(labelElement);
      dayElement.appendChild(phaseNameElement);
      weekScreenElement.appendChild(dayElement);
    }
  }

  fitWeekDescriptions();
}

// -- Screen switching --
function openWeekScreen() {
  body.classList.remove('day', 'night', 'frame-b');
  body.classList.add('week');

  // The week menu follows the day/night colors
  if (isNight(new Date().getHours())) {
    body.classList.add('week-night');
  }

  loadWeekScreen();
}

function closeWeekScreen() {
  body.classList.remove('week', 'week-night');
  updateBackground();
}

// -- Buttons --
weeklyMoonsButtonElement.addEventListener('click', () => {
  if (body.classList.contains('week')) {
    closeWeekScreen();
  } else {
    openWeekScreen();
  }
});

minimizeButtonElement.addEventListener('click', () => {
  window.api.minimizeApp();
});

exitButtonElement.addEventListener('click', () => {
  window.api.closeApp();
});

// -- Cursor sparkles: state --
let sparkles = [];
let isAnimatingSparkles = false;
let lastSparkleTime = 0;

// -- Cursor sparkles: canvas --
function resizeSparkleCanvas() {
  sparkleCanvas.width = window.innerWidth;
  sparkleCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeSparkleCanvas);
resizeSparkleCanvas();

// 4-point star
function drawStar(x, y, size) {
  const inner = size * 0.21;

  sparkleCtx.beginPath();
  sparkleCtx.moveTo(x, y - size);
  sparkleCtx.lineTo(x + inner, y - inner);
  sparkleCtx.lineTo(x + size, y);
  sparkleCtx.lineTo(x + inner, y + inner);
  sparkleCtx.lineTo(x, y + size);
  sparkleCtx.lineTo(x - inner, y + inner);
  sparkleCtx.lineTo(x - size, y);
  sparkleCtx.lineTo(x - inner, y - inner);
  sparkleCtx.closePath();
  sparkleCtx.fill();
}

// Each sparkle shrinks, rises and fades out over its lifetime
function animateSparkles(now) {
  sparkleCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
  sparkles = sparkles.filter((sparkle) => now - sparkle.born < SPARKLE_LIFETIME);

  if (sparkles.length === 0) {
    isAnimatingSparkles = false;
    return;
  }

  sparkleCtx.fillStyle = 'gold';

  sparkles.forEach((sparkle) => {
    const progress = (now - sparkle.born) / SPARKLE_LIFETIME;

    sparkleCtx.globalAlpha = 1 - progress;
    drawStar(sparkle.x, sparkle.y - 6 * progress, 3.5 * (1 - 0.8 * progress));
  });

  requestAnimationFrame(animateSparkles);
}

function spawnSparkle(x, y) {
  sparkles.push({ x, y, born: performance.now() });

  if (!isAnimatingSparkles) {
    isAnimatingSparkles = true;
    requestAnimationFrame(animateSparkles);
  }
}

// Mouse position comes from the main process
window.api.onMousePosition(({ x, y }) => {
  const now = Date.now();

  if (now - lastSparkleTime < SPARKLE_INTERVAL) {
    return;
  }

  lastSparkleTime = now;
  spawnSparkle(x, y);
});

// -- Pause mouse tracking over interactive elements --
let isOverInteractiveElement = false;

document.addEventListener('mouseover', (event) => {
  const isInteractive = event.target.closest('.no-drag-region');

  if (isInteractive && !isOverInteractiveElement) {
    isOverInteractiveElement = true;
    window.api.pauseMouseTracking();
  }
});

document.addEventListener('mouseout', (event) => {
  const stillInteractive = event.relatedTarget && event.relatedTarget.closest('.no-drag-region');

  if (!stillInteractive && isOverInteractiveElement) {
    isOverInteractiveElement = false;
    window.api.resumeMouseTracking();
  }
});

// -- Init --
updateBackground();
loadMoon();
startStarTwinkle();