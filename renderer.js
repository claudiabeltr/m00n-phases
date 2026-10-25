const body = document.body;

// -- DOM elements --
const bgElement = document.getElementById('bg');
const moonElement = document.getElementById('moon');
const moonNameElement = document.getElementById('moon-name');
const moonDateElement = document.getElementById('moon-date');
const moonDescElement = document.getElementById('moon-desc');
const weekScreenElement = document.getElementById('week-screen');
const exitButtonElement = document.getElementById('exit-btn');
const minimizeButtonElement = document.getElementById('minimize-btn');
const weeklyMoonsButtonElement = document.getElementById('weeklymoons-btn');

// -- Moon phase data --
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

// Left position of each day slot, matching UI-week.png
const WEEK_SLOT_POSITIONS = [3.9, 18.0, 32.0, 46.1, 59.8, 74.2, 88.3];

// -- Day/night helpers --
function isNight(hour) {
  return hour >= 18 || hour < 6;
}

function getTonightDate(now) {
  const d = new Date(now);
  const isPastMidnight = d.getHours() < 6;

  if (isPastMidnight) {
    d.setDate(d.getDate() - 1);
  }

  return d;
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

// -- Moon phase helpers --
function getPhaseIndex(apiKey) {
  const index = PHASES.findIndex((phase) => phase.key === apiKey);

  if (index === -1) {
    return 0;
  }

  return index;
}

// Keeps a sprite's background position correct in pixels, even as
// the element's size changes on window resize
function setMoonPhaseSprite(element, phaseIndex) {
  element.dataset.phaseIndex = phaseIndex;

  const applySprite = () => {
    const elementWidth = Math.round(element.getBoundingClientRect().width);

    if (elementWidth === 0) {
      return;
    }

    const spriteWidth = elementWidth * 8;
    element.style.backgroundSize = `${spriteWidth}px ${elementWidth}px`;
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

// -- Main screen: tonight's moon --
async function loadMoon() {
  const currentHour = new Date().getHours();

  if (!isNight(currentHour)) {
    return;
  }

  const tonight = getTonightDate(new Date());
  const tonightFormatted = formatDate(tonight);

  try {
    const phaseKey = await window.api.getMoonPhase(tonightFormatted);
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

// -- Week screen: description fills the space down to the card bottom --
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

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(anchorDate);
    date.setDate(date.getDate() + dayOffset);

    const dateFormatted = formatDate(date);

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
      const phaseKey = await window.api.getMoonPhase(dateFormatted);
      const phaseIndex = getPhaseIndex(phaseKey);
      const phase = PHASES[phaseIndex];

      phaseNameElement.textContent = phase.name;
      phaseDescElement.textContent = phase.desc;

      dayElement.appendChild(labelElement);
      dayElement.appendChild(phaseNameElement);
      dayElement.appendChild(phaseDescElement);
      weekScreenElement.appendChild(dayElement);

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

// -- Buttons --
exitButtonElement.addEventListener('click', () => {
  window.api.closeApp();
});

weeklyMoonsButtonElement.addEventListener('click', () => {
  const isWeekScreenOpen = body.classList.contains('week');

  if (isWeekScreenOpen) {
    body.classList.remove('week', 'week-night');
    updateBackground();
  } else {
    body.classList.remove('day', 'night', 'frame-b');
    body.classList.add('week');

    if (isNight(new Date().getHours())) {
      body.classList.add('week-night');
    }

    loadWeekScreen();
  }
});

minimizeButtonElement.addEventListener('click', () => {
  window.api.minimizeApp();
});

// -- Cursor sparkle trail --
let lastSparkleTime = 0;

function spawnSparkle(x, y) {
  const sparkle = document.createElement('div');
  sparkle.className = 'cursor-sparkle';
  sparkle.style.left = `${x}px`;
  sparkle.style.top = `${y}px`;

  document.body.appendChild(sparkle);

  sparkle.addEventListener('animationend', () => {
    sparkle.remove();
  });
}

window.api.onMousePosition(({ x, y }) => {
  const now = Date.now();

  if (now - lastSparkleTime < 30) {
    return;
  }

  lastSparkleTime = now;
  spawnSparkle(x, y);
});

// -- Init --
updateBackground();
loadMoon();

if (isNight(new Date().getHours())) {
  setInterval(() => body.classList.toggle('frame-b'), 800);
}