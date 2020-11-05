const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const scrape = require('website-scraper');
const PuppeteerPlugin = require('website-scraper-puppeteer');
const path = require('path');
const fs = require("fs");
let win, URL
app.on('ready', ()=>{
   
         win = new BrowserWindow({
          width: 800,
          height: 600,
          frame: false,
          webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
          }
        })
      
        win.loadFile('public/index.html')

})

ipcMain.on('open-error-dialog', (event) => {
    dialog.showErrorBox('URL INVALID', 'Please enter a valid URL \n eg. https://google.com')
  })

ipcMain.on("URLCLONE", (event, url)=>{
    URL = url
    let defpath = "C:/Locally/"
    if (fs.existsSync(defpath.concat(extractHostname(URL)))) {
      
      shell.openPath(defpath.concat(extractHostname(URL)))

  }else{
    scrape({
      // Provide the URL(s) of the website(s) that you want to clone
      // In this example, you can clone the Our Code World website
      urls: URL,
      // Specify the path where the content should be saved
      // In this case, in the current directory inside the ourcodeworld dir
      directory: path.resolve(defpath.concat(extractHostname(URL)) ),
      urlFilter: function(url){
        // If url contains the domain of the website, then continue:
        if(url.indexOf(URL) === 0){
          win.webContents.send('links', `<b style="color:#ff1d1d">>_ URL</b> ${url} <b style="color:#ff1d1d;">found</b> ${URL}`)
            
            return true;
        }
        
        return false;
    },
        recursive: true,
        maxDepth: 1,
      // Load the Puppeteer plugin
      plugins: [ 
          new PuppeteerPlugin({
              launchOptions: { 
                  // If you set  this to true, the headless browser will show up on screen
                  headless: true,
              }, /* optional */
              scrollToBottom: {
                  timeout: 10000, 
                  viewportN: 10 
              } /* optional */
          })
      ]
  }).then((result) => {
    dialog.showMessageBox(
      {
        message: "Website succesfully downloaded",
        buttons: ["See Website", "Close"],
        defaultId: 0, // bound to buttons array
        cancelId: 1 // bound to buttons array
      })
      .then(result => {
        if (result.response === 0) {
          // bound to buttons array
          shell.openPath(defpath.concat(extractHostname(URL)))
        } else if (result.response === 1) {
          // bound to buttons array
          win.webContents.send('clearField')
        }
      }
    );
}).catch((err) => {
    dialog.showErrorBox(err, 'Please check your internet connection !')
});
  }

})



function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

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