const body = document.body;

// -- DOM elements --
const bgElement = document.getElementById('bg');
const moonElement = document.getElementById('moon');
const moonNameElement = document.getElementById('moon-name');
const moonDateElement = document.getElementById('moon-date');
const moonDescElement = document.getElementById('moon-desc');
const weekScreenElement = document.getElementById('week-screen');
const exitButtonElement = document.getElementById('exit-btn');
const weeklyMoonsButtonElement = document.getElementById('weeklymoons-btn');

// -- Moon phase data --
const PHASES = [
  {
    key: 'New Moon',
    name: 'Luna nueva',
    desc: 'La cara visible no recibe luz solar directa.'
  },
  {
    key: 'Waxing Crescent',
    name: 'Creciente',
    desc: 'Una pequeña porción comienza a iluminarse.'
  },
  {
    key: 'First Quarter',
    name: 'Cuarto creciente',
    desc: 'La mitad está iluminada y va en aumento.'
  },
  {
    key: 'Waxing Gibbous',
    name: 'Gibosa creciente',
    desc: 'Casi toda la luna está iluminada.'
  },
  {
    key: 'Full Moon',
    name: 'Luna llena',
    desc: 'Toda la cara visible está iluminada.'
  },
  {
    key: 'Waning Gibbous',
    name: 'Gibosa menguante',
    desc: 'Empieza a perder iluminación.'
  },
  {
    key: 'Last Quarter',
    name: 'Cuarto menguante',
    desc: 'La mitad está iluminada y va en descenso.'
  },
  {
    key: 'Waning Crescent',
    name: 'Menguante',
    desc: 'Solo una pequeña porción sigue iluminada.'
  }
];

// Left position of each day slot, matching UI-week.png
const WEEK_SLOT_POSITIONS = [3.9, 18.0, 32.0, 46.1, 59.8, 74.2, 88.3];

// Gaps between the 8 phase frames in the sprite sheet
//const PHASE_STEP = 100 / 7;

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

// -- Background (day/night switch) --
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
}

// -- Week screen: next 7 moons --
async function loadWeekScreen() {
  weekScreenElement.innerHTML = '';

  const anchorDate = getTonightDate(new Date());

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(anchorDate);
    date.setDate(date.getDate() + dayOffset);

    const dateFormatted = formatDate(date);
    const phaseKey = await window.api.getMoonPhase(dateFormatted);
    const phaseIndex = getPhaseIndex(phaseKey);
    const phase = PHASES[phaseIndex];

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
    phaseNameElement.textContent = phase.name;

    dayElement.appendChild(labelElement);
    dayElement.appendChild(phaseNameElement);
    weekScreenElement.appendChild(dayElement);

    setMoonPhaseSprite(dayElement, phaseIndex);
  }
}

// -- Buttons --
exitButtonElement.addEventListener('click', () => {
  window.api.closeApp();
});

weeklyMoonsButtonElement.addEventListener('click', () => {
  const isWeekScreenOpen = body.classList.contains('week');

  if (isWeekScreenOpen) {
    body.classList.remove('week');
    updateBackground(); // !! restores 'day' or 'night'
  } else {
    body.classList.remove('day', 'night', 'frame-b');
    body.classList.add('week');
    loadWeekScreen();
  }
});

// -- Init --
updateBackground();
loadMoon();

if (isNight(new Date().getHours())) {
  setInterval(() => body.classList.toggle('frame-b'), 800);
}