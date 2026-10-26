const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

const SCALE = 3;
const WIDTH = 256 * SCALE;
const HEIGHT = 97 * SCALE;

const LAT = 40.4168;
const LNG = -3.7038;

let splashWindow;
let mainWindow;

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
        minWidth: 512,
        minHeight: 192,
        resizable: true,
        frame: false,
        transparent: true,
        show: false, // stays hidden until ready
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.setAspectRatio(WIDTH / HEIGHT);
    mainWindow.loadFile('index.html');

    // Swap splash for main window once both are ready
    const minimumSplashTime = new Promise((resolve) => {
        setTimeout(resolve, 1200);
    });

    const windowReady = new Promise((resolve) => {
        mainWindow.once('ready-to-show', resolve);
    });

    Promise.all([minimumSplashTime, windowReady]).then(() => {
        splashWindow.close();
        mainWindow.show();
    });

    // -- Mouse tracking for the cursor sparkle trail --
    let mouseTrackingInterval = setInterval(sendMousePosition, 50);

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

    ipcMain.on('pause-mouse-tracking', () => {
        clearInterval(mouseTrackingInterval);
    });

    ipcMain.on('resume-mouse-tracking', () => {
        clearInterval(mouseTrackingInterval);
        mouseTrackingInterval = setInterval(sendMousePosition, 50);
    });
}

app.whenReady().then(() => {
    createSplashWindow();
    createMainWindow();
});

// Close app when close window.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('close-app', () => {
    app.quit();
});

ipcMain.on('minimize-app', () => {
    BrowserWindow.getFocusedWindow().minimize();
});

// Moon Phase API
ipcMain.handle('get-moon-phase', async (event, dateStr) => {
    const url = `https://api.sunrise-sunset.org/v2?lat=${LAT}&lng=${LNG}&date=${dateStr}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) }); // 8s timeout

    if (!res.ok) {
        throw new Error('API ERROR: ' + res.status);
    }
    const data = await res.json();
    return data.moon_phase;
});