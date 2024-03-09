const { app, BrowserWindow, ipcMain, shell } = require("electron");
const serve = require("electron-serve");
const path = require("path");
const { spawn } = require("child_process");

const appServe = app.isPackaged
  ? serve({
      directory: path.join(__dirname, "../out"),
    })
  : null;

const checkPythonVersion = () => {
  return new Promise((resolve, reject) => {
    let python = "python3";
    const pyVersionCheck = spawn(python, ["--version"]);

    pyVersionCheck.on("error", () => {
      python = "python";
      const pyVersionCheckFallback = spawn(python, ["--version"]);
      pyVersionCheckFallback.stdout.on("data", (data) => {
        if (data.toString().includes("Python 3")) {
          resolve(python);
        } else {
          reject(new Error("Python 3 not found"));
        }
      });
      pyVersionCheckFallback.stderr.on("data", (data) => {
        reject(new Error("Python 3 not found"));
      });
    });

    pyVersionCheck.stdout.on("data", (data) => {
      if (data.toString().includes("Python 3")) {
        resolve(python);
      }
    });

    pyVersionCheck.stderr.on("data", (data) => {
      resolve(python);
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
