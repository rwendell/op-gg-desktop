const { app, BrowserWindow, session, screen, Menu, MenuItem } = require('electron')
const path = require('path');
const { electron } = require('process');
const { homedir } = require('os');





app.whenReady().then((createWindow) => {
  return  { width, height } = screen.getPrimaryDisplay().workAreaSize 
})




  app.commandLine.appendSwitch('--enable-feature=allow-insecure-localhost')
  app.commandLine.appendSwitch('--disable-feature=network-service')
  app.commandLine.appendSwitch('enable-feature=extensions-on-chrome-urls')
  
  const menu = new Menu()
  menu.append(new MenuItem ({ label: 'home', click() { win.loadURL('https://op.gg') } }))
  Menu.setApplicationMenu(menu);

  function createWindow () {
    // Create the browser window.
    const win = new BrowserWindow({
      width: width * .5,
      height: height * .9,
      webPreferences: {
        nodeIntegration: true
      }
    })


app.on('ready', async () => {
    await session.defaultSession.loadExtension(path.join(__dirname, 'extensions\\opgg'))
    // Note that in order to use the React DevTools extension, you'll need to
    // download and unzip a copy of the extension.
})

win.loadURL('https://op.gg')

  
}

app.whenReady().then(createWindow)
