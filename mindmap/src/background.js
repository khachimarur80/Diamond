'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const path = require('path');
const fs = require('fs-extra');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

//Variables to store the changing and available 2 windows
let vaultWindow
let mainWindow

//Store the current vault we are using
let currentVault

//Useful functions

//Get the directory of a given file
function getTargetDirectory(directory) {
  if (!directory) {
    return currentVault;
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
//Generate tree data for TreeView.vue
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
//Send tree data for TreeView.vue
function handleRequestTreeData(vaultName) {
  if (mainWindow) {
    mainWindow.webContents.send("tree-data-response", generateTreeData(vaultName))
  }
  else if (vaultWindow) {
    vaultWindow.webContents.send("tree-data-response", generateTreeData(vaultName))
  }
}
//Send app data for Main.vue
function handleRequestLoadData(vaultName) {
  fs.readFile(vaultName, 'utf-8', (err, fileContent) => {  
    if (mainWindow) {
      mainWindow.webContents.send('load-data-response', fileContent);
    }
  });
}
//Send file data (MD contents) for TextEditor.vue
function handleRequestFileData(fileName) {
  const filePath = fileName;

  fs.readFile(filePath, 'utf-8', (err, fileContent) => { 
    mainWindow.webContents.send('file-data-response', fileContent);
  });
}

//Functions to create windows
//Different functions cuz of different styling

function createMainWindow(devPath, prodPath) {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 1025,
    height: 800,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 11, y: 12 },
    backgroundColor: '#262626',
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, '../src/preload.js')
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + devPath)
  } else {
    createProtocol('app')
    win.loadURL(`app://./${prodPath}`)
  }

  return win
}

function createVaultWindow(devPath) {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#262626',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 11, y: 12 },
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, '../src/preload.js')
    }
  })
  win.setMaximizable(false);
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + devPath)
  }
  else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }

  return win
}


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  //Open vaultWindow by default
  if (BrowserWindow.getAllWindows().length === 0) {
    vaultWindow = createVaultWindow('')
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
  //Open vaultWindow by default
  vaultWindow = createVaultWindow('')

  //Open system file dialog
  ipcMain.on('open-file-browser', (event) => {
    console.log("Opening file browser!")
    const options = {
      properties: ['openDirectory'],
    };
  
    dialog.showOpenDialog(vaultWindow, options).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedFolderPath = result.filePaths[0];
      // Send selected folder for vault selection in vaultWindow
      vaultWindow.webContents.send('open-file-browser-response' ,selectedFolderPath)
    }
    else {
      vaultWindow.webContents.send('open-file-browser-response' , null)
    }
    });
  });
  //Provide file and directories in the vault with their structure
  ipcMain.on('request-tree-data', (event, vaultName) => {
    console.log("Tree data requested!\n")
    handleRequestTreeData(vaultName)
  })
  //Provide app configuration saved in a json file
  ipcMain.on('request-file-data', (event, fileName) => {
    console.log("File data requested!\n")
    handleRequestFileData(fileName)
  })
  //Delete file in filePath
  ipcMain.on('request-file-deletion', (event, filePath) => {
    console.log('File deletion requested:', filePath);

    const absoluteFilePath = path.resolve(filePath);
    fs.remove(absoluteFilePath, ()=>{})
  });
  //Write changes on MD
  ipcMain.on('request-save-file', (event, fileName, fileData) => {
    console.log("Saving file requested!\n")
    fs.writeFile(fileName, fileData, ()=>{});
  });
  //Create MD file for word object if it does not exist
  ipcMain.on('request-load-word', (event, group, word) => {
    console.log("Loading word requested!\n")
    const mainDir = path.dirname(group);
    const wordsDir = path.join(mainDir, 'words');

    //Check if directory for words exist
    if (!fs.existsSync(wordsDir)) {
      fs.mkdirSync(wordsDir);
    }

    const mdFilePath = path.join(wordsDir, `${word}.md`);

    //Generate MD file for word object if there is none
    if (!fs.existsSync(mdFilePath)) {
      fs.writeFile(mdFilePath, '', 'utf8', () => {
      });
    }

    mainWindow.webContents.send('load-word-response', mdFilePath)
  });
  //Create MD file for category object if it does not exist
  ipcMain.on('request-load-category', (event, group, category) => {
    console.log("Loading category requested!\n")
    const mainDir = path.dirname(group);
    const categoriesDir = path.join(mainDir, 'categories');

    //Check if directory for categories exist
    if (!fs.existsSync(categoriesDir)) {
      //Create if there is none
      fs.mkdirSync(categoriesDir);
    }

    const mdFilePath = path.join(categoriesDir, `${category}.md`);

    //Generate MD file for category object if there is none
    if (!fs.existsSync(mdFilePath)) {
      fs.writeFile(mdFilePath, '', 'utf8', () => {
      });
    }

    mainWindow.webContents.send('load-category-response', mdFilePath)
  });
  //Create MD file for connection object if it does not exist
  ipcMain.on('request-load-connection', (event, group, connection) => {
    console.log("Loading connection requested!\n")
    const mainDir = path.dirname(group);
    const connectionsDir = path.join(mainDir, 'connections');

    //Check if directory for connections exist
    if (!fs.existsSync(connectionsDir)) {
      //Create if there is none
      fs.mkdirSync(connectionsDir);
    }

    const mdFilePath = path.join(connectionsDir, `${connection}.md`);

    //Generate MD file for connection object if there is none
    if (!fs.existsSync(mdFilePath)) {
      fs.writeFile(mdFilePath, '', 'utf8', () => {
      });
    }

    mainWindow.webContents.send('load-connection-response', mdFilePath)
  });
  //Save app data for given vault
  ipcMain.on('request-save-data', (event, jsonData, vaultName) => {
    console.log("Saving data requested!\n")
    fs.writeFile(vaultName, jsonData, ()=>{});
  });
  //Send app data for given vault
  ipcMain.on('request-load-data', (event, vaultName) => {
    console.log("Loading data requested!\n")
    handleRequestLoadData(vaultName)
  })
  //New vault creation given a path and name
  ipcMain.on('create-new-vault', (event, vaultName, vaultLocation) => {
    console.log("Creating new vault!\n")
    const vaultPath = path.join(vaultLocation, vaultName);

    fs.mkdirSync(vaultPath);

    const mdFilePath = path.join(vaultPath, vaultName + '.md');
    fs.writeFileSync(mdFilePath, '', 'utf-8');

    const jsonFilePath = path.join(vaultPath, vaultName + '.json');
    fs.writeFileSync(jsonFilePath, '{}', 'utf-8');

    //Provide vault data for Main.vue vault initialization
    //Necessary for currentGroup creation, the object that 
    //handles and stores everything in a vault
    vaultWindow.webContents.send('vault-creation-response', {name: vaultName, id: vaultPath});
  });
  //Given a vault, set currentVault to that one
  ipcMain.on('open-vault', (event, vaultName) => {
    console.log("Opening vault "+vaultName+"!\n")
    currentVault = vaultName
    if (vaultWindow) {
      vaultWindow.close()
      vaultWindow = null;
    }
    if (mainWindow) {
      mainWindow.close()
      mainWindow = null;
    }
    mainWindow = createMainWindow('subpage', 'subpage.html')

    mainWindow.on('blur', () => {
      mainWindow.webContents.executeJavaScript('document.documentElement.style.setProperty("--main-bg", "#262626")')
    });

    mainWindow.on('focus', () => {
      mainWindow.webContents.executeJavaScript('document.documentElement.style.setProperty("--main-bg", "#363636")')
    });
  });
  //Request for currentVault info
  //Request made from Main.vue for its initialization
  ipcMain.on('vault-data', (event) => {
    mainWindow.webContents.send("vault-name-response", currentVault);
  })
  ipcMain.on('register-function-call', (event, file, text) => {
    fs.appendFile(file, text, (err) => {})
  })
  ipcMain.on('file-update-request', (event, file, oldVal, newVal) => {
    fs.readFile(file, 'utf8', (err, data) => {
      const updatedContent = data.replace(oldVal, newVal);
      fs.writeFile(file, updatedContent, 'utf8', (err) => {
      });
    });
  });
  //Change filename given path and value
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

  fs.rename(targetFile, newFilePath, () => {
      mainWindow.webContents.send('change-filename-response', newFilePath);
    });
  });
  //File creation on given directory
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
  //Folder creation on given directory
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
  //Current vault closening to open vault menu
  ipcMain.on('exit-vault', (event) => {
    console.log("Opening vault menu!")
    if (!vaultWindow) {
      vaultWindow = createVaultWindow('')
    }
    else {
      vaultWindow.focus()
    }
  });
  //Move file from origin to destiny
  ipcMain.on('move-file-request', (event, origin, destiny) => {
    console.log('Moving file requested!')
    const originFilePath = path.resolve(origin);
    const destinyFilePath = path.resolve(destiny);

    if (fs.existsSync(originFilePath)) {
      if (fs.existsSync(destinyFilePath) && fs.statSync(destinyFilePath).isDirectory()) {
        const fileName = path.basename(originFilePath);

        const newFilePath = path.join(destinyFilePath, fileName);

        fs.rename(originFilePath, newFilePath, () => {});
      }
    }
  });
  //Check if a path is valid
  //Used for elimination of deleted or moved vaults
  // in vaultWindow
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