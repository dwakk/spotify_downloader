require("dotenv").config();
import fs from "fs";
import { Request, Response } from "express";
import archiver from "archiver";
import contentDisposition from "content-disposition";
import { AlbumContent, PlaylistContent, TrackContent } from "./interfaces";
import {
  fetchAlbum,
  fetchPlaylist,
  spotifyApi,
  fetchTrack,
  initializeSpotifyClient,
  downloadSong,
  encodeString,
} from "./utils";

export async function downloadAlbum(req: Request, res: Response) {
  try {
    const id = req.query.id;
    if (typeof id !== "string") throw new Error("Id must be a string");
    const { name, tracks, artists } = await fetchAlbum(id);
    const sanitizedAlbumName = name.replace(" ", "-");
    const zipName = `${sanitizedAlbumName}`;
    const zip = fs.createWriteStream(zipName);
    const archive = archiver("zip");
    archive.pipe(zip);

    const paths: string[] = [];

    for (const track of tracks.items) {
      if (!track?.name || !track?.artists[0]) continue;
      const artist = track.artists[0];
      if (!artist) continue;
      let filePath: string;
      try {
        filePath = await downloadSong(track.name, artist.name);
      } catch (err) {
        console.error(err);
        continue;
      }
      paths.push(filePath);
      const filenameArray = filePath.split("\\");
      const filename = filenameArray.pop();
      if (filenameArray.length === 0 || !filename) {
        console.error("Invalid file path or filename not found.");
        continue;
      } else {
        const customFilename = `${track.name}_${artist.name}.mp3`.replace(
          " ",
          "-"
        );
        archive.append(fs.createReadStream(filePath), { name: customFilename });
      }
    }

    archive.finalize();

    zip.on("finish", function () {
      for (const p of paths) {
        fs.unlink(p, (err) => {
          if (err) {
            console.error("Error while deleting file:", err);
          }
        });
      }
      const artist = artists[0].name;
      const base64name = encodeString(zipName);
      const base64artist = encodeString(artist);

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        contentDisposition(zipName + ".zip")
      );
      res.setHeader("Access-Control-Expose-Headers", "*");
      res.setHeader("X-Name", base64name);
      res.setHeader("X-Artist", base64artist);
      const fileStream = fs.createReadStream(zip.path);
      fileStream.pipe(res);
      fileStream.on("close", () => {
        fs.unlink(zip.path, (err) => {
          if (err) {
            console.error("Error while deleting file:", err);
          }
        });
      });
    });
  } catch (err) {
    res.sendStatus(500);
    console.error(err);
  }
}

export async function downloadPlaylist(req: Request, res: Response) {
  try {
    const id = req.query.id;
    if (typeof id !== "string" || !id) throw new Error("Invalid id");
    const pl = await fetchPlaylist(id);
    const { name, image, author, tracks, total } = pl;
    const sanitizedPlaylistName = name.replace(" ", "-");
    const zipName = sanitizedPlaylistName + ".zip";
    const zip = fs.createWriteStream(zipName);
    const archive = archiver("zip");
    archive.pipe(zip);

    const paths: string[] = [];

    for (const t of tracks.items) {
      if (t.is_local) continue;
      const { track } = t;
      if (!track?.name || !track?.artists[0]) continue;
      const artist = track.artists[0];
      if (!artist) continue;
      let filePath: string;
      try {
        filePath = await downloadSong(track.name, artist.name);
      } catch (err) {
        console.error(err);
        continue;
      }
      paths.push(filePath);
      const filenameArray = filePath.split("\\");
      const filename = filenameArray.pop();
      if (filenameArray.length === 0 || !filename) {
        console.error("Invalid file path or filename not found.");
      } else {
        const customFilename = `${track.name}_${artist.name}.mp3`.replace(
          " ",
          "-"
        );
        archive.append(fs.createReadStream(filePath), { name: customFilename });
      }
    }

    archive.finalize();

    zip.on("finish", function () {
      for (const p of paths) {
        fs.unlink(p, (err) => {
          if (err) {
            console.error("Error while deleting file:", err);
          }
        });
      }

      const base64name = encodeString(zipName);

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", contentDisposition(zipName));
      res.setHeader("Access-Control-Expose-Headers", "*");
      res.setHeader("X-Name", base64name);
      const fileStream = fs.createReadStream(zip.path);
      fileStream.pipe(res);
      fileStream.on("close", () => {
        fs.unlink(zip.path, (err) => {
          if (err) {
            console.error("Error while deleting file:", err);
          }
        });
      });
    });
  } catch (err) {
    res.sendStatus(500);
    console.error(err);
  }
}

export async function downloadSingleSong(req: Request, res: Response) {
  try {
    await initializeSpotifyClient();
    const id = req.query.id;
    if (typeof id !== "string" || !id) throw new Error("Invalid id");
    const track = await spotifyApi.getTrack(id);
    const { name, artists, is_local } = track.body;
    const artist = artists[0];
    if (is_local) throw new Error("Can't download local tracks");
    const filePath = await downloadSong(name, artist.name);

    const base64name = encodeString(name);
    const base64artist = encodeString(artist.name);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", contentDisposition(filePath));
    res.setHeader("Access-Control-Expose-Headers", "*");
    res.setHeader("X-Name", base64name);
    res.setHeader("X-Artist", base64artist);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("end", () => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error while deleting file:", err);
        }
      });
    });
  } catch (error) {
    console.error("Error while downloading song:", error);
    res.status(500).send("Error while downloading song");
  }
}

export async function getGlobalInfo(req: Request, res: Response) {
  try {
    const { type, id } = req.query;
    if (!id || typeof id !== "string") {
      throw new Error("Invalid id");
    }
    if (
      typeof type !== "string" ||
      !["playlist", "album", "track"].includes(type)
    ) {
      throw new Error("Type must be a string");
    }
    let data: AlbumContent | PlaylistContent | TrackContent;
    switch (type) {
      case "playlist": {
        data = await fetchPlaylist(id);
        res.json(data).status(200);
        break;
      }
      case "track": {
        data = await fetchTrack(id);
        res.json(data).status(200);
        break;
      }
      case "album": {
        data = await fetchAlbum(id);
        res.json(data).status(200);
        break;
      }
      default: {
        res.json({ msg: "not found" }).status(404);
      }
    }
  } catch (err) {
    console.error("Error while fetching:", err);
    res.status(500).send("Error while fetching");
  }
}
