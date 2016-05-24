#!/usr/bin/env electron

// load electron
const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
// Module for registering keyboard shortcuts
const globalShortcut = electron.globalShortcut

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, webContents
// Read custom css to string
let customCSS
require('fs').readFile('custom.css', 'utf8', function (err, contents) {
  if (err) {
    return console.error(err)
  }
  customCSS = contents
})

/**
 * Serves the emoji web app
 * @return {void}
 */
function serve () {
  var nodeStatic = require('node-static')
  var file = new nodeStatic.Server('./emoji')

  require('http').createServer(function (request, response) {
    request.addListener('end', function () {
      // Serve the files
      file.serve(request, response)
    }).resume()
  }).listen(8237)
}

/**
 * Inject the custom CSS to window
 * @return {void}
 */
function injectCustomCSS () {
  webContents.insertCSS(customCSS)
}

/**
 * Creates the Electron window
 * @return {void}
 */
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})
  mainWindow.loadURL('http://localhost:8237')

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Single page app, no need to keep window instance
    mainWindow = null
  })

  webContents = mainWindow.webContents
  // Inject css
  webContents.on('did-finish-load', injectCustomCSS)
  webContents.on('did-navigate-in-page', injectCustomCSS)
}

// Electron is initialized
app.on('ready', () => {
  // create gui
  createWindow()

  // Escape to minimize
  globalShortcut.register('Escape', () => {
    mainWindow.minimize()
  })

  // Ctrl+Q to quit
  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit()
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// start the emoji server
serve()
