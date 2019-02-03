const {app, BrowserWindow} = require('electron')
require('electron-reload')(__dirname);
const Server = require('./server');
const options = require('./options');
const server = new Server(options);

let mainWindow

app.inspect = function(){
  app.win.toggleDevTools();
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 694, 
    height: 580, 
    frame: false,
    // resizable: false,
    transparent: true,
    movable: true
  })
  mainWindow.loadFile('index.html')
  mainWindow.setBackgroundColor("#FFFF")
  // mainWindow.setOpacity(0.78)

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', function (){
  createWindow()

  server.start();
  server.hello();
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

