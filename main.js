const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const SCALE = 3;
const WIDTH = 256 * SCALE;
const HEIGHT = 97 * SCALE;

const COORDS = '40.7128,-74.0060';
const TZ = '0';

// -- WINDOW MOONPHASE --
function createWindow() {
    const win = new BrowserWindow({
        width: WIDTH,
        height: HEIGHT,
        minWidth: 256,
        minHeight: 96,
        resizable: true,
        frame: false,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.setAspectRatio(WIDTH / HEIGHT); // <- keep 8:3 ratio on resize
    win.loadFile('index.html');
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

// Moon Phase API
ipcMain.handle('get-moon-phase', async (event, dateStr) => {
    const url = `https://aa.usno.navy.mil/api/rstt/oneday?date=${dateStr}&coords=${COORDS}&tz=${TZ}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new('API ERROR: ' + res.status);
    }
    const data = await res.json();
    return data.properties.data.curphase;
});