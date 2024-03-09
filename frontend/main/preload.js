const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback);
  },
  send: (channel, args) => {
    ipcRenderer.send(channel, args);
  },
  sendSudoku: (puzzle) => ipcRenderer.send("solve", puzzle),
  addListener: (channel, callback) => {
    ipcRenderer.on(channel, callback);
    return () => ipcRenderer.removeListener(channel, callback);
  },
  solvedSudoku: (callback) => ipcRenderer.on("solved", callback),
  error: (callback) => ipcRenderer.on("error", callback),
  openExternal: (url) => ipcRenderer.send("openExternal", url),
});
