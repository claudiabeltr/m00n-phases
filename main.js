// ======================================================
// m00n-phases - main process
// ======================================================

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

// -- Window size --
const SCALE = 3;
const WIDTH = 256 * SCALE;
const HEIGHT = 97 * SCALE;
const MIN_WIDTH = 512;
const MIN_HEIGHT = 192;

// -- Location used for the moon data --
const LAT = 40.4168;
const LNG = -3.7038;

// -- Timings (ms) --
const MIN_SPLASH_TIME = 1200;
const MOUSE_TRACKING_INTERVAL = 50;
const API_TIMEOUT = 8000;

let splashWindow;
let mainWindow;
let mouseTrackingInterval;

// -- Splash window --
function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: WIDTH,
        height: HEIGHT,
        resizable: false,
        frame: false,
        transparent: true,
        alwaysOnTop: true
    });

    splashWindow.loadFile('loading.html');
}

// -- Main window --
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: WIDTH,
        height: HEIGHT,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        resizable: true,
        frame: false,
        transparent: true,
        show: false, // stays hidden until ready
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.setAspectRatio(WIDTH / HEIGHT); // keep the proportions on resize
    mainWindow.loadFile('index.html');

    swapSplashForMainWindow();
    startMouseTracking();
}

// Closes the splash once the main window is ready AND the minimum time passed
function swapSplashForMainWindow() {
    const minimumSplashTime = new Promise((resolve) => {
        setTimeout(resolve, MIN_SPLASH_TIME);
    });

    const windowReady = new Promise((resolve) => {
        mainWindow.once('ready-to-show', resolve);
    });

    Promise.all([minimumSplashTime, windowReady]).then(() => {
        splashWindow.close();
        mainWindow.show();
    });
}

// -- Mouse tracking (for the cursor sparkles) --
function sendMousePosition() {
    if (!mainWindow || mainWindow.isDestroyed()) {
        return;
    }

    const { x, y } = screen.getCursorScreenPoint();
    const bounds = mainWindow.getBounds();

    const isInsideWindow =
        x >= bounds.x &&
        x <= bounds.x + bounds.width &&
        y >= bounds.y &&
        y <= bounds.y + bounds.height;

    if (isInsideWindow) {
        mainWindow.webContents.send('mouse-position', {
            x: x - bounds.x,
            y: y - bounds.y
        });
    }
}

function startMouseTracking() {
    clearInterval(mouseTrackingInterval); // avoids duplicated intervals
    mouseTrackingInterval = setInterval(sendMousePosition, MOUSE_TRACKING_INTERVAL);
}

function stopMouseTracking() {
    clearInterval(mouseTrackingInterval);
}

// -- Moon phase API --
async function fetchMoonPhase(dateStr) {
    const url = `https://api.sunrise-sunset.org/v2?lat=${LAT}&lng=${LNG}&date=${dateStr}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(API_TIMEOUT) });

    if (!res.ok) {
        throw new Error('API ERROR: ' + res.status);
    }

    const data = await res.json();
    return data.moon_phase;
}

// -- IPC: window controls --
ipcMain.on('close-app', () => {
    app.quit();
});

ipcMain.on('minimize-app', () => {
    mainWindow.minimize();
});

// -- IPC: mouse tracking --
ipcMain.on('pause-mouse-tracking', stopMouseTracking);
ipcMain.on('resume-mouse-tracking', startMouseTracking);

// -- IPC: moon data --
ipcMain.handle('get-moon-phase', (event, dateStr) => fetchMoonPhase(dateStr));

// -- App lifecycle --
app.whenReady().then(() => {
    createSplashWindow();
    createMainWindow();
});

// Close the app when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});