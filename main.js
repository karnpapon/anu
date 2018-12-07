const {app, BrowserWindow} = require('electron')
require('electron-reload')(__dirname);

let mainWindow

app.inspect = function(){
  app.win.toggleDevTools();
}

function createWindow () {
  mainWindow = new BrowserWindow({width: 694, height: 580, frame: false})
  mainWindow.loadFile('index.html')

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

