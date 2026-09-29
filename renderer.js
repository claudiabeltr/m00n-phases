const body = document.body;
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

// -- Day/night check --
function isNight(hour) {
  return hour >= 18 || hour < 6;
}

// -- Background --
function updateBackground() {
  const hour = new Date().getHours();

  body.classList.remove('day', 'night', 'frame-b');

  if (isNight(hour)) {
    body.classList.add('night');
  } else {
    body.classList.add('day');
  }
}

updateBackground();

if (isNight(new Date().getHours())) {
  setInterval(() => body.classList.toggle('frame-b'), 800);
}

// -- Buttons --
// Close button
document.getElementById('exit-btn').addEventListener('click', () => {
  window.api.closeApp();
});

// -- Moon Phases logic --
function getPhaseIndex(apiKey) {
  const i = PHASES.findIndex(p => p.key === apiKey);

  if (index === -1) {
    return 0;
  }

  return index;
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function getTonightDate(now) {
  const d = new Date(now);
  const isPastMidnight = Date.getHours() < 6;

  if (isPastMidnight) {
    Date.setDate(Date.getDate() - 1);
  }

  return Date;

}

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

  const moonElement = document.getElementById('moon');
  const moonNameElement = document.getElementById('moon-name');
  const moonDateElement = document.getElementById('moon-date');
  const moonDescElement = document.getElementById('moon-desc');

  const step = 100 / 7; // 7 gaps between 8 frames
  moonElement.style.backgroundPosition = `-${phaseIndex * step}% 0`;

  moonNameElement.textContent = phase.name;
  moonDateElement.textContent = tonight.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  moonDescElement.textContent = phase.desc;
}

loadMoon();