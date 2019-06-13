const {app, BrowserWindow} = require('electron')
// require('electron-reload')(__dirname);
const Server = require('./server');
const options = require('./options');
const server = new Server(options);
const url = require('url')
const path = require('path')

let mainWindow
let devtools = null

app.inspect = function(){
  app.win.toggleDevTools();
}

function createDevTools(){
  devtools = new BrowserWindow({
    frame: false, 
    backgroundColor: '#0000',
  })
  mainWindow.webContents.setDevToolsWebContents(devtools.webContents)
  mainWindow.webContents.openDevTools({ mode: 'detach' })
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 694, 
    height: 580, 
    // resizable: false,
    frame: false,
    // movable: true
    // frame: process.platform !== 'darwin',
    // skipTaskbar: process.platform === 'darwin',
    // autoHideMenuBar: process.platform === 'darwin'
  })
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '/src/index.html'),
    protocol: 'file:',
    slashes: true
  }))
  // mainWindow.webContents.openDevTools()
  // mainWindow.setBackgroundColor("#CBCBCB")
  // mainWindow.setOpacity(0.78)

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', function (){
  createWindow()
  createDevTools()

  server.start();
  // server.hello();
})

app.on('window-all-closed', () => {
  server.stop();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

