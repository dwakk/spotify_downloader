function Exit() {
  const { ipcRenderer } = require('electron')
  ipcRenderer.invoke("exit");
}

function Minimize() {
  const { ipcRenderer } = require('electron')
  ipcRenderer.invoke("min");
}

function Maximize() {
  const { ipcRenderer } = require('electron')
  ipcRenderer.invoke("max");
}