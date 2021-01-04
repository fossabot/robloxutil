const { app, BrowserWindow, TouchBar, shell, Menu, MenuItem }                  = require('electron');
const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar
const prompt                                            = require('electron-prompt');
const fs                                                = require('fs')

const menu = new Menu()
menu.append(new MenuItem({
  label: 'Roblox User Info',
  submenu: [{
    role: 'help',
    accelerator: process.platform === 'darwin' ? 'Cmd+H' : 'Ctrl+H',
    click: () => { shell.openPath("./help.html") }
  }]
}))

Menu.setApplicationMenu(menu)

function createWindow () {
  prompt({
    title: 'Enter a Roblox Username',
    label: 'Username:',
    value: '',
    inputAttrs: {
        type: 'text'
    },
    type: 'input'
})
.then((r) => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        titleBarStyle: 'hiddenInset',
        webPreferences: {
          nodeIntegration: true
        }
      })
    win.loadFile('loading.html')
    if(r === null) {
        console.log('user cancelled');
        process.exit()
    } else {
        (async() => {
            const getUser = require("roblox-user-information")
            await getUser(r).then(user => {
                const username                                          = new TouchBarLabel({ label: 'Username: ' + r })
                const issue                                             = new TouchBarButton({ 
                    label: 'Report an issue', 
                    backgroundColor: '#FF0000',
                    click: () => {
                        shell.openExternal(`mailto:juiciiofficial@gmail.com?subject=[ISSUE] Roblox User Grabber&body=%5BError%20Info%5D%0A%0ARoblox%20Username%3A%20${r}%0AError%20Type%3A%202%0ADevice%3A%20MacOS%0A%0A%5BUser%20Info%5D%0A%0A`)
                      }
                })
                const touchBar                                          = new TouchBar({ items: [ username, new TouchBarSpacer({ size: 'small' }), issue ] })
                fs.writeFile('./result.json', `{ "input": "${r}" }`, (err) => {
                    // throws an error, you could also catch it here
                    if (err) throw err;
                    
                })
                fs.writeFile('./user.json', JSON.stringify(user), (err) => {
                    // throws an error, you could also catch it here
                    if (err) throw err;
                    win.loadFile("done.html")
                })
                setTimeout(function(){ win.loadFile('index.html'); win.setTouchBar(touchBar) }, 5000);
            })
          })()
        
    }
})
.catch(console.error);
  
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

