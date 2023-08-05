require("dotenv").config();
import express from "express";
import cors from "cors";
import {
  downloadAlbum,
  downloadPlaylist,
  downloadSingleSong,
  getGlobalInfo,
} from "./middleware";

const app = express();
app.use(cors());

app.get('/api/info', getGlobalInfo)
app.get("/api/playlist", downloadPlaylist);
app.get("/api/track", downloadSingleSong);
app.get("/api/album", downloadAlbum);

app.listen("3000", async () => {
  console.log("Listening on port 3000");
});
