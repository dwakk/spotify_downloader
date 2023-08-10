const { app, BrowserWindow, ipcMain } = require("electron");

let mainWindow;
let isMaximized = false;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const middleware_1 = require("./middleware");
const api = (0, express_1.default)();
api.use((0, cors_1.default)());
api.get('/api/info', middleware_1.getGlobalInfo);
api.get("/api/playlist", middleware_1.downloadPlaylist);
api.get("/api/track", middleware_1.downloadSingleSong);
api.get("/api/album", middleware_1.downloadAlbum);
api.listen("3000", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Listening on port 3000");
}));


app.on("ready", () => {
  mainWindow = new BrowserWindow({
    title: "Spotify - Downloader",
    width: 1150,
    height: 650,
    minWidth: 550,
    minHeight: 417,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  ipcMain.handle("exit", () => {
    BrowserWindow.getFocusedWindow().destroy();
  });

  ipcMain.handle("min", () => {
    BrowserWindow.getFocusedWindow().minimize();
  });

  mainWindow.once("ready-to-show", () => {});

  ipcMain.handle("max", () => {
    if (isMaximized) {
      mainWindow.unmaximize();
      isMaximized = false;
    } else {
      mainWindow.maximize();
      isMaximized = true;
    }
  });
});
