const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    closeApp: () => ipcRenderer.send('close-app'),
    minimizeApp: () => ipcRenderer.send('minimize-app'),
    getMoonPhase: (dateStr) => ipcRenderer.invoke('get-moon-phase', dateStr),
    onMousePosition: (callback) => ipcRenderer.on('mouse-position', (event, pos) => callback(pos)),
    pauseMouseTracking: () => ipcRenderer.send('pause-mouse-tracking'),
    resumeMouseTracking: () => ipcRenderer.send('resume-mouse-tracking')
});