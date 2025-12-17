/**
 * Photoshop Workflow Manager
 * Process principal Electron
 */

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const { exec } = require('child_process');

// ═══════════════════════════════════════════════════════════════════════════════
// CHEMINS
// ═══════════════════════════════════════════════════════════════════════════════

const isDev = process.argv.includes('--dev');

// En développement : utiliser le dossier du projet
// En production : utiliser ~/Documents/PhotoshopManager/
const userDataPath = isDev 
  ? path.join(__dirname, '..', '..', '..') 
  : path.join(app.getPath('documents'), 'PhotoshopManager');

// Chemin des ressources embarquées (pour copier les fichiers par défaut)
const resourcesPath = isDev
  ? path.join(__dirname, '..', '..', '..')
  : process.resourcesPath;

const configPath = path.join(userDataPath, 'config.yaml');
const scriptsPath = path.join(userDataPath, 'scripts');
const presetsPath = path.join(userDataPath, 'presets');

let mainWindow;

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALISATION DES DONNÉES UTILISATEUR
// ═══════════════════════════════════════════════════════════════════════════════

function initializeUserData() {
  // Créer le dossier principal si nécessaire
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
    console.log('Dossier utilisateur créé:', userDataPath);
  }

  // Copier config.yaml par défaut si absent
  if (!fs.existsSync(configPath)) {
    const defaultConfig = path.join(resourcesPath, 'config.yaml');
    if (fs.existsSync(defaultConfig)) {
      fs.copyFileSync(defaultConfig, configPath);
      console.log('Configuration par défaut copiée');
    }
  }

  // Copier les scripts par défaut si le dossier est vide
  if (!fs.existsSync(scriptsPath)) {
    const defaultScripts = path.join(resourcesPath, 'scripts');
    if (fs.existsSync(defaultScripts)) {
      copyFolderRecursive(defaultScripts, scriptsPath);
      console.log('Scripts par défaut copiés');
    }
  }

  // Créer le dossier presets
  if (!fs.existsSync(presetsPath)) {
    fs.mkdirSync(presetsPath, { recursive: true });
  }
}

function copyFolderRecursive(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyFolderRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRÉATION DE LA FENÊTRE
// ═══════════════════════════════════════════════════════════════════════════════

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 950,
    height: 680,
    minWidth: 800,
    minHeight: 550,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#E8E8E8',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GESTION DE LA CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

function loadConfig() {
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    return yaml.load(configContent);
  } catch (error) {
    console.error('Erreur chargement config:', error);
    return null;
  }
}

function loadPresets() {
  const presetsFile = path.join(presetsPath, 'user-presets.json');
  try {
    if (fs.existsSync(presetsFile)) {
      return JSON.parse(fs.readFileSync(presetsFile, 'utf8'));
    }
  } catch (error) {
    console.error('Erreur chargement presets:', error);
  }
  return [];
}

function savePresets(presets) {
  try {
    const presetsFile = path.join(presetsPath, 'user-presets.json');
    fs.writeFileSync(presetsFile, JSON.stringify(presets, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde presets:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXÉCUTION DES SCRIPTS PHOTOSHOP
// ═══════════════════════════════════════════════════════════════════════════════

const PHOTOSHOP_VERSIONS = [
  'Adobe Photoshop 2025',
  'Adobe Photoshop 2024',
  'Adobe Photoshop 2023',
  'Adobe Photoshop CC 2022',
  'Adobe Photoshop CC 2021',
  'Adobe Photoshop CC'
];

function runPhotoshopScript(scriptFile, params = {}) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(scriptsPath, scriptFile);
    
    if (!fs.existsSync(scriptPath)) {
      reject(new Error(`Script non trouvé: ${scriptFile}`));
      return;
    }
    
    // Créer un fichier temporaire avec les paramètres
    const tempParamsFile = path.join(app.getPath('temp'), 'ps_params.json');
    fs.writeFileSync(tempParamsFile, JSON.stringify(params));
    
    tryPhotoshopVersions(PHOTOSHOP_VERSIONS, scriptPath, tempParamsFile)
      .then(result => {
        try { fs.unlinkSync(tempParamsFile); } catch (e) {}
        resolve(result);
      })
      .catch(error => {
        try { fs.unlinkSync(tempParamsFile); } catch (e) {}
        reject(error);
      });
  });
}

function tryPhotoshopVersions(versions, scriptPath, paramsFile) {
  return new Promise((resolve, reject) => {
    if (versions.length === 0) {
      reject(new Error('Photoshop non trouvé. Assurez-vous qu\'Adobe Photoshop est installé.'));
      return;
    }
    
    const version = versions[0];
    const appleScript = `
      tell application "${version}"
        activate
        do javascript file "${scriptPath}" with arguments {"${paramsFile}"}
      end tell
    `;
    
    exec(`osascript -e '${appleScript.replace(/'/g, "\\'")}'`, (error, stdout, stderr) => {
      if (error) {
        // Essayer la version suivante
        tryPhotoshopVersions(versions.slice(1), scriptPath, paramsFile)
          .then(resolve)
          .catch(reject);
      } else {
        resolve({ success: true, output: stdout });
      }
    });
  });
}

function runBatchProcess(scriptFile, inputFolder, outputFolder, params = {}) {
  return new Promise((resolve, reject) => {
    const batchParams = {
      ...params,
      inputFolder,
      outputFolder,
      batchMode: true
    };
    
    runPhotoshopScript(scriptFile, batchParams)
      .then(resolve)
      .catch(reject);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// IPC HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

ipcMain.handle('get-config', () => loadConfig());
ipcMain.handle('get-presets', () => loadPresets());
ipcMain.handle('save-presets', (event, presets) => savePresets(presets));

ipcMain.handle('get-paths', () => ({
  config: configPath,
  scripts: scriptsPath,
  presets: presetsPath,
  userData: userDataPath
}));

ipcMain.handle('run-script', async (event, { scriptFile, params }) => {
  try {
    return await runPhotoshopScript(scriptFile, params);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('run-batch', async (event, { scriptFile, inputFolder, outputFolder, params }) => {
  try {
    return await runBatchProcess(scriptFile, inputFolder, outputFolder, params);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-folder', async (event, options = {}) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    ...options
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('open-folder', (event, folderPath) => {
  shell.openPath(folderPath);
});

ipcMain.handle('open-config', () => {
  shell.openPath(configPath);
});

ipcMain.handle('open-scripts-folder', () => {
  shell.openPath(scriptsPath);
});

ipcMain.handle('open-user-folder', () => {
  shell.openPath(userDataPath);
});

// ═══════════════════════════════════════════════════════════════════════════════
// APP LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════════

app.whenReady().then(() => {
  initializeUserData();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
