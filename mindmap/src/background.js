'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const path = require('path');
const fs = require('fs-extra');
const url = require('url');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let vaultWindow
let mainWindow
let currentVault

function getTargetDirectory(directory) {
  if (!directory) {
    return currentVault; // Default target directory
  }

  if (fs.existsSync(directory)) {
    if (fs.statSync(directory).isDirectory()) {
      return directory;
    } else {
      const fileDirectory = path.dirname(directory);
      console.log(`Using directory of the file: ${fileDirectory}`);
      return fileDirectory;
    }
  } else {
    console.log('Invalid directory path');
    return null;
  }
}

function generateTreeData(dirPath) {
  function readDirectoryRecursively(currentPath, parentDirectories = []) {
    const files = fs.readdirSync(currentPath);

    const treeNodes = files.map((file) => {
      if (file === '.DS_Store' || file.endsWith('.json') || file.endsWith('.obsidian')) {
        return null;
      }

      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      const isDirectory = stat.isDirectory();
      const fileName = path.parse(file).name;

      const ancestors = [...parentDirectories];

      return {
        id: filePath,
        name: fileName,
        children: isDirectory ? readDirectoryRecursively(filePath, [...parentDirectories, fileName]) : [],
        open: false,
        isDirectory,
        ancestors,
      };
    });

    // Filter out the null values and sort the nodes.
    const sortedTreeNodes = treeNodes.filter((node) => node !== null)
      .sort((a, b) => {
        // Files come first, then directories.
        if (a.isDirectory === b.isDirectory) {
          return 0;
        } else if (a.isDirectory) {
          return -1; // 'a' is a directory, it should come after 'b'.
        } else {
          return 1; // 'a' is a file, it should come before 'b'.
        }
      });

    return sortedTreeNodes;
  }

  return readDirectoryRecursively(dirPath);
}

function setVaultName(vaultName) {
  mainWindow.webContents.executeJavaScript(`localStorage.setItem('vault', '${vaultName}');`);
}

function handleRequestTreeData(vaultName) {
  if (mainWindow) {
    mainWindow.webContents.send("tree-data-response", generateTreeData(vaultName))
  }
  else if (vaultWindow) {
    vaultWindow.webContents.send("tree-data-response", generateTreeData(vaultName))
  }
}

function handleRequestLoadData(vaultName) {
  fs.readFile(vaultName, 'utf-8', (err, fileContent) => {  
    if (mainWindow) {
      mainWindow.webContents.send('load-data-response', fileContent);
    }
  });
}

function handleRequestFileData(fileName) {
  const filePath = fileName;

  fs.readFile(filePath, 'utf-8', (err, fileContent) => { 
    mainWindow.webContents.send('file-data-response', fileContent);
  });
}

function createMainWindow(devPath, prodPath) {
  // Create the browser window.
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, '../src/preload.js')
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL + devPath)
    if (!process.env.IS_TEST) window.webContents.openDevTools()
  } else {
    // Load the index.html when not in development
    window.loadURL(`app://./${prodPath}`)
  }

  return window
}

function createVaultWindow(devPath, prodPath) {
  // Create the browser window.
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, '../src/preload.js')
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL + devPath)
    if (!process.env.IS_TEST) window.webContents.openDevTools()
  } else {
    // Load the index.html when not in development
    window.loadURL(`app://./${prodPath}`)
  }

  return window
}


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    vaultWindow = createVaultWindow('', 'index.html')
  }
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  vaultWindow = createVaultWindow('', 'index.html')

  ipcMain.on('open-file-browser', (event) => {
    console.log("Opening file browser!")
    const options = {
      properties: ['openDirectory'],
    };
  
    dialog.showOpenDialog(vaultWindow, options).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedFolderPath = result.filePaths[0];
      // Use the selected folder path in your application
      vaultWindow.webContents.send('open-file-browser-response' ,selectedFolderPath)
    }
    else {
      vaultWindow.webContents.send('open-file-browser-response' , null)
    }
    });
  });

  ipcMain.on('request-tree-data', (event, vaultName) => {
    console.log("Tree data requested!\n")
    handleRequestTreeData(vaultName)
  })

  ipcMain.on('request-file-data', (event, fileName) => {
    console.log("File data requested!\n")
    handleRequestFileData(fileName)
  })

  ipcMain.on('request-file-deletion', (event, filePath) => {
    console.log('File deletion requested:', filePath);

    const absoluteFilePath = path.resolve(filePath);
    fs.remove(absoluteFilePath, ()=>{})
  });

  ipcMain.on('request-save-file', (event, fileName, fileData) => {
    console.log("Saving file requested!\n")
    fs.writeFile(fileName, fileData, ()=>{});
  });

  ipcMain.on('request-load-word', (event, group, word) => {
    console.log("Loading word requested!\n")
    const mainDir = path.dirname(group);
    const wordsDir = path.join(mainDir, 'words');

    if (!fs.existsSync(wordsDir)) {
      fs.mkdirSync(wordsDir);
    }

    const mdFilePath = path.join(wordsDir, `${word}.md`);

    if (fs.existsSync(mdFilePath)) {
      fs.readFile(mdFilePath, 'utf8', (err, data) => {
        event.reply('load-word-success', data);
      });
    } 
    else {
      fs.writeFile(mdFilePath, '', 'utf8', (err) => {
      });
    }

    mainWindow.webContents.send('load-word-response', mdFilePath)
  });

  ipcMain.on('request-load-category', (event, group, category) => {
    console.log("Loading category requested!\n")
    const mainDir = path.dirname(group);
    const categoriesDir = path.join(mainDir, 'categories');

    if (!fs.existsSync(categoriesDir)) {
      fs.mkdirSync(categoriesDir);
    }

    const mdFilePath = path.join(categoriesDir, `${category}.md`);

    if (fs.existsSync(mdFilePath)) {
      fs.readFile(mdFilePath, 'utf8', (err, data) => {
        event.reply('load-word-success', data);
      });
    } 
    else {
      fs.writeFile(mdFilePath, '', 'utf8', (err) => {
      });
    }

    mainWindow.webContents.send('load-category-response', mdFilePath)
  });

  ipcMain.on('request-load-connection', (event, group, connection) => {
    console.log("Loading connection requested!\n")
    const mainDir = path.dirname(group);
    const connectionsDir = path.join(mainDir, 'connections');

    if (!fs.existsSync(connectionsDir)) {
      fs.mkdirSync(connectionsDir);
    }

    const mdFilePath = path.join(connectionsDir, `${connection}.md`);

    if (fs.existsSync(mdFilePath)) {
      fs.readFile(mdFilePath, 'utf8', (err, data) => {
        event.reply('load-connection-success', data);
      });
    } 
    else {
      fs.writeFile(mdFilePath, '', 'utf8', (err) => {
      });
    }

    mainWindow.webContents.send('load-connection-response', mdFilePath)
  });

  ipcMain.on('request-save-data', (event, jsonData, vaultName) => {
    console.log("Saving data requested!\n")
    fs.writeFile(vaultName, jsonData, ()=>{});
  });

  ipcMain.on('request-load-data', (event, vaultName) => {
    console.log("Loading data requested!\n")
    handleRequestLoadData(vaultName)
  })

  ipcMain.on('create-new-vault', (event, vaultName, vaultLocation) => {
    console.log("Creating new vault!\n")
    const vaultPath = path.join(vaultLocation, vaultName);

    fs.mkdirSync(vaultPath);

    const mdFilePath = path.join(vaultPath, vaultName + '.md');
    fs.writeFileSync(mdFilePath, '', 'utf-8');

    const jsonFilePath = path.join(vaultPath, vaultName + '.json');
    fs.writeFileSync(jsonFilePath, '{}', 'utf-8');

    vaultWindow.webContents.send('vault-creation-response', {name: vaultName, id: vaultPath});
  });

  ipcMain.on('open-vault', async (event, vaultName) => {
    console.log("Opening vault "+vaultName+"!\n")
    currentVault = vaultName
    if (vaultWindow) {
      vaultWindow.close();
      vaultWindow = null;
    }

    mainWindow = createMainWindow('subpage', 'subpage.html')

    mainWindow.on('blur', () => {
      mainWindow.webContents.executeJavaScript('document.documentElement.style.setProperty("--main-bg", "#262626")')
    });

    mainWindow.on('focus', () => {
      mainWindow.webContents.executeJavaScript('document.documentElement.style.setProperty("--main-bg", "#363636")')
    });
  });

  ipcMain.on('close-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.close();
      app.quit()
    }
  });

  ipcMain.on('minimize-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.minimize();
    }
  });

  ipcMain.on('expand-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
  });

  ipcMain.on('vault-data', (event) => {
    mainWindow.webContents.send("vault-name-response", currentVault);
  })

ipcMain.on('request-change-filename', (event, targetFile, value) => {
  console.log("Change filename requested!");
  console.log(targetFile);
  console.log("\n");
  const currentFilePath = path.dirname(targetFile);
  const currentFileName = path.basename(targetFile);

  const ext = path.extname(currentFileName);
  const newFileName = value + ext;
  const newFilePath = path.join(currentFilePath, newFileName);

  if (fs.existsSync(newFilePath)) {
    mainWindow.webContents.send('change-filename-response', false);
    return;
  }

  fs.rename(targetFile, newFilePath, (err) => {
    mainWindow.webContents.send('change-filename-response', newFilePath);
  });
});
  
  ipcMain.on('create-file', (event, directory) => {
    const targetDirectory = getTargetDirectory(directory);

    if (!targetDirectory) {
      return;
    }

    let fileName = 'untitled.md';
    let count = 1;
    let filePath = path.join(targetDirectory, fileName);

    while (fs.existsSync(filePath)) {
      fileName = `untitled ${count}.md`;
      filePath = path.join(targetDirectory, fileName);
      count++;
    }

    fs.writeFileSync(filePath, '', 'utf-8'); // Create an empty file

    mainWindow.webContents.send('create-file-response' ,filePath)
  });

  ipcMain.on('create-folder', (event, directory) => {
    const targetDirectory = getTargetDirectory(directory);

    if (!targetDirectory) {
      return;
    }

    let folderName = 'untitled';
    let count = 1;
    let folderPath = path.join(targetDirectory, folderName);

    while (fs.existsSync(folderPath)) {
      folderName = `untitled ${count}`;
      folderPath = path.join(targetDirectory, folderName);
      count++;
    }

    fs.mkdirSync(folderPath);

    mainWindow.webContents.send('create-folder-response' ,folderPath)
  });

  ipcMain.on('exit-vault', (event, vaultName) => {
    console.log("Opening vault menu!")

    vaultWindow = createVaultWindow('', 'index.html')
  });

  ipcMain.on('open-file-browser', (event) => {
    console.log("Opening file browser!")
    const options = {
      properties: ['openDirectory'],
    };

    dialog.showOpenDialog(vaultWindow, options).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedFolderPath = result.filePaths[0];
      // Use the selected folder path in your application
      vaultWindow.webContents.send('open-file-browser-response' ,selectedFolderPath)
    }
    else {
      vaultWindow.webContents.send('open-file-browser-response' , null)
    }
  });
  });

  ipcMain.on('move-file-request', (event, origin, destiny) => {
    console.log('Moving file requested!')
    const originFilePath = path.resolve(origin);
    const destinyFilePath = path.resolve(destiny);

    if (fs.existsSync(originFilePath)) {
      if (fs.existsSync(destinyFilePath) && fs.statSync(destinyFilePath).isDirectory()) {
        const fileName = path.basename(originFilePath);

        const newFilePath = path.join(destinyFilePath, fileName);

        fs.rename(originFilePath, newFilePath, (err) => {});
      }
    }
  });

  ipcMain.on('path-valid', (event, path) => {
    if (fs.existsSync(path)) {
      vaultWindow.webContents.send('path-valid-response', true)
    }
    else {
      vaultWindow.webContents.send('path-valid-response', false)
    }
  })
})

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}