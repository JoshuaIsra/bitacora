const { app, BrowserWindow } = require('electron');

const createWindow = () => {
  const window = new BrowserWindow({  
    width: 1500,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    }

})
    window.loadFile('bitacora.html')
}

app.whenReady().then(createWindow);
