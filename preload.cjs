const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openDeployWindow: (content, deploymentTime) => ipcRenderer.send('open-deploy-window', { content, deploymentTime })
});