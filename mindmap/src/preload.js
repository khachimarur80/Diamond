const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  requestTreeData: (vaultName) => ipcRenderer.send('request-tree-data', vaultName),
  requestFileData: (fileName) => ipcRenderer.send('request-file-data', fileName),
  requestSaveData: (jsonData, vaultName) => ipcRenderer.send('request-save-data', jsonData, vaultName),
  requestSaveFile: (fileName, fileData) => ipcRenderer.send('request-save-file', fileName, fileData),
  requestLoadWord: (group, word) => ipcRenderer.send('request-load-word', group, word),
  requestLoadCategory: (group, category) => ipcRenderer.send('request-load-category', group, category),
  requestLoadConnection: (group, connection) => ipcRenderer.send('request-load-connection', group, connection),
  requestLoadData: (vaultName) => ipcRenderer.send('request-load-data', vaultName),teNewVault: (vaultName) => ipcRenderer.send("create-new-vault", vaultName),
  openVault: (vaultName) => ipcRenderer.send("open-vault", vaultName),
  requestChangeFileName: (targetFile, value) => ipcRenderer.send('request-change-filename', targetFile, value),
  createNewVault: (vaultName, vaultLocation) => ipcRenderer.send("create-new-vault", vaultName, vaultLocation),
  requestFileDeletion: (fileName) => ipcRenderer.send('request-file-deletion', fileName),
  closeWindow: () => ipcRenderer.send('close-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  expandWindow: () => ipcRenderer.send('expand-window'),
  createFile: (directory) => ipcRenderer.send('create-file', directory),
  createFolder: (directory) => ipcRenderer.send('create-folder', directory),
  response: (channel, listener) => {
    const onceListener = (event, ...args) => {
      ipcRenderer.removeListener(channel, onceListener);
      listener(...args);
    };
    
    ipcRenderer.on(channel, onceListener);
  },
  exitVault: () => ipcRenderer.send('exit-vault'),
  openFileBrowser: () => ipcRenderer.send('open-file-browser'),
  moveFileRequest: (filepath, destinypath) => ipcRenderer.send('move-file-request', filepath, destinypath),
  pathValid: (path) => ipcRenderer.send('path-valid', path),
  requestVaultData: () => ipcRenderer.send('vault-data')
})

//ipcRenderer.on(channel, (event, ...args) => listener(...args))