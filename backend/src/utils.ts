import SpotifyWebApi from "spotify-web-api-node";
import { Playlist, Album, Track } from "./classes";
import { PlaylistContent, AlbumContent, TrackContent } from "./interfaces";
import ytdl from "ytdl-core";
import fs from "fs";
import path from "path";
const youtube = require("./search.js");

export const spotifyApi = new SpotifyWebApi({
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
});

export async function initializeSpotifyClient() {
  const data = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(data.body.access_token);
}

export async function fetchPlaylist(i: string): Promise<PlaylistContent> {
  try {
    await initializeSpotifyClient();
    const response = await spotifyApi.getPlaylist(i);
    const playlist = new Playlist(response.body);
    return {
      name: playlist.name,
      image: playlist.image,
      author: playlist.author,
      tracks: playlist.tracks,
      total: playlist.total,
      id: playlist.id,
    };
  } catch (err) {
    throw err;
  }
}

export async function fetchAlbum(i: string): Promise<AlbumContent> {
  try {
    await initializeSpotifyClient();
    const response = await spotifyApi.getAlbum(i);
    const album = new Album(response.body);
    return {
      name: album.name,
      image: album.image,
      artists: album.artists,
      tracks: album.tracks,
      total: album.total,
      id: album.id,
      release_date: album.release_date
    };
  } catch (err) {
    throw err;
  }
}

export async function fetchTrack(i: string): Promise<TrackContent> {
  try {
    await initializeSpotifyClient();
    const response = await spotifyApi.getTrack(i);
    const track = new Track(response.body);
    return {
      name: track.name,
      image: track.image,
      artists: track.artists,
      id: track.id,
    };
  } catch (err) {
    throw err;
  }
}

export async function getVideoId(title: string, artist: string) {
  try {
    const query = `${title} ${artist}`;
    const data = await youtube.GetListByKeyword(query);
    const id = data.items[0].id;
    if (!id) throw new Error("no video found");
    return id;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function downloadSong(
  title: string,
  artist: string
): Promise<string> {
  try {
    const id = await getVideoId(title, artist);
    const url = `https://youtube.com/watch?v=${id}`;
    const videoInfo = await ytdl.getInfo(url);

    let audioFormat = ytdl
      .filterFormats(videoInfo.formats, "audio")
      .find((format) => format.container === "mp4");

    if (!audioFormat) {
      throw new Error("Audio format not available");
    }
    audioFormat.quality = "highestaudio";

    const audioStream = ytdl(url, { format: audioFormat });
    const filePath = path.join(
      __dirname,
      "tmp",
      `${title.replace(" ", "-")}-${artist.replace(" ", "-")}.mp3`
    );

    await new Promise<void>((resolve, reject) => {
      audioStream
        .pipe(fs.createWriteStream(filePath))
        .on("finish", () => {
          resolve();
        })
        .on("error", (error) => {
          reject(error);
        });
    });

    return filePath;
  } catch (error) {
    console.error("Error while downloading song:", error);
    throw error;
  }
}

export function encodeString(str: string): string {
  const bufferData = Buffer.from(str, "utf-8");
  const buffer64 = bufferData.toString("base64");
  return buffer64;
}