const { contextBridge, ipcRenderer } = require('electron');

// -- API exposed to the renderer (window.api) --
contextBridge.exposeInMainWorld('api', {
    // Window controls
    closeApp: () => ipcRenderer.send('close-app'),
    minimizeApp: () => ipcRenderer.send('minimize-app'),

    // Moon data
    getMoonPhase: (dateStr) => ipcRenderer.invoke('get-moon-phase', dateStr),

    // Cursor sparkles
    onMousePosition: (callback) => ipcRenderer.on('mouse-position', (event, pos) => callback(pos)),
    pauseMouseTracking: () => ipcRenderer.send('pause-mouse-tracking'),
    resumeMouseTracking: () => ipcRenderer.send('resume-mouse-tracking')
});