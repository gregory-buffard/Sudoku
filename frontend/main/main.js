const { app, BrowserWindow, ipcMain, shell } = require("electron");
const serve = require("electron-serve");
const path = require("path");
const { spawn, exec } = require("child_process");

const appServe = app.isPackaged
  ? serve({
      directory: path.join(__dirname, "../out"),
    })
  : null;

const checkPythonVersion = () => {
  return new Promise((resolve, reject) => {
    exec("python3 --version", (error, stdout, stderr) => {
      if (!error && stdout.includes("Python")) {
        resolve("python3");
      } else {
        exec("python --version", (error, stdout, stderr) => {
          if (!error && (stdout + stderr).includes("Python")) {
            resolve("python");
          } else {
            exec("py --version", (error, stdout, stderr) => {
              if (!error && (stdout + stderr).includes("Python")) {
                resolve("py");
              } else {
                reject(
                  new Error(
                    "Python wasn't found on this system. Please install via Microsoft Store/python.org and try again.",
                  ),
                );
              }
            });
          }
        });
      }
    });
  });
};

const createWindow = () => {
  ipcMain.on("solve", (e, args) => {
    checkPythonVersion()
      .then((python) => {
        const pyProcess = spawn(python, [
          path.join(
            app.getAppPath(),
            "..",
            "app.asar.unpacked",
            "main",
            "services",
            "solver.py",
          ),
        ]);
        pyProcess.stdin.write(JSON.stringify(args));
        pyProcess.stdin.end();

        pyProcess.stdout.on("data", (data) => {
          if (data.toString().includes("unsolvable")) {
            e.reply("error", "unsolvable");
            return;
          }
          e.reply("solved", JSON.parse(data.toString()));
        });

        pyProcess.stderr.on("data", (data) => {
          console.error(`stderr: ${data}`);
          e.reply("error", data.toString());
        });
      })
      .catch((e) => console.error(e));
  });
  ipcMain.on("openExternal", (e, args) => {
    shell.openExternal(args);
  });
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL("app://-");
      win.setMenuBarVisibility(false);
    });
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", (e, code, desc) => {
      win.webContents.reloadIgnoringCache();
    });
  }
};

app.on("ready", () => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
