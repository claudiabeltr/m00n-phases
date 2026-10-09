const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

const SCALE = 3;
const WIDTH = 256 * SCALE;
const HEIGHT = 97 * SCALE;

const LAT = 40.4168;
const LNG = -3.7038;

// -- WINDOW MOONPHASE --
function createWindow() {
    const win = new BrowserWindow({
        width: WIDTH,
        height: HEIGHT,
        minWidth: 512,
        minHeight: 192,
        resizable: true,
        frame: false,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.setAspectRatio(WIDTH / HEIGHT); // <- keep 8:3 ratio on resize
    win.loadFile('index.html');
    // Forward global mouse movement to the renderer, for the sparkle trail
    setInterval(() => {
    const { x, y } = screen.getCursorScreenPoint();
    const bounds = win.getBounds();

    const isInsideWindow =
        x >= bounds.x &&
        x <= bounds.x + bounds.width &&
        y >= bounds.y &&
        y <= bounds.y + bounds.height;

    if (isInsideWindow) {
        win.webContents.send('mouse-position', {
        x: x - bounds.x,
        y: y - bounds.y
        });
    }
    }, 150);
    //win.webContents.openDevTools();
}

// When Electron is ready, then create Window.
app.whenReady().then(createWindow);

// Close app when close window.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('close-app', () => {
    app.quit();
});

ipcMain.on('minimize-app', () => {
    BrowserWindow.getFocusedWindow().minimize();
})

// Moon Phase API
ipcMain.handle('get-moon-phase', async (event, dateStr) => {
    const url = `https://api.sunrise-sunset.org/v2?lat=${LAT}&lng=${LNG}&date=${dateStr}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('API ERROR: ' + res.status);
    }
    const data = await res.json();
    return data.moon_phase;
});