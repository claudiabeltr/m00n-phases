const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    closeApp: () => ipcRenderer.send('close-app'),
    getMoonPhase: (dateStr) => ipcRenderer.invoke('get-moon-phase', dateStr)
});