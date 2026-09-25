const body = document.body;

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