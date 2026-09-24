const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const SCALE = 3;
const WIDTH = 256 * SCALE;
const HEIGHT = 97 * SCALE;

function createWindow() {
    const win = new BrowserWindow({
        width: WIDTH,
        height: HEIGHT,
        resizable: true,
        frame: false,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

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