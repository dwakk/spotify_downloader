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
exports.encodeString = exports.downloadSong = exports.getVideoId = exports.fetchTrack = exports.fetchAlbum = exports.fetchPlaylist = exports.initializeSpotifyClient = exports.spotifyApi = void 0;
const spotify_web_api_node_1 = __importDefault(require("spotify-web-api-node"));
const classes_1 = require("./classes");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const youtube = require("./search.js");
exports.spotifyApi = new spotify_web_api_node_1.default({
    clientId: "f65f77fde82b4562852ba6f37254c2c8",
    clientSecret: "040a1e4700f14801833c2b4ce56c63f6",
});
function initializeSpotifyClient() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield exports.spotifyApi.clientCredentialsGrant();
        exports.spotifyApi.setAccessToken(data.body.access_token);
    });
}
exports.initializeSpotifyClient = initializeSpotifyClient;
function fetchPlaylist(i) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield initializeSpotifyClient();
            const response = yield exports.spotifyApi.getPlaylist(i);
            const playlist = new classes_1.Playlist(response.body);
            return {
                name: playlist.name,
                image: playlist.image,
                author: playlist.author,
                tracks: playlist.tracks,
                total: playlist.total,
                id: playlist.id,
            };
        }
        catch (err) {
            throw err;
        }
    });
}
exports.fetchPlaylist = fetchPlaylist;
function fetchAlbum(i) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield initializeSpotifyClient();
            const response = yield exports.spotifyApi.getAlbum(i);
            const album = new classes_1.Album(response.body);
            return {
                name: album.name,
                image: album.image,
                artists: album.artists,
                tracks: album.tracks,
                total: album.total,
                id: album.id,
                release_date: album.release_date
            };
        }
        catch (err) {
            throw err;
        }
    });
}
exports.fetchAlbum = fetchAlbum;
function fetchTrack(i) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield initializeSpotifyClient();
            const response = yield exports.spotifyApi.getTrack(i);
            const track = new classes_1.Track(response.body);
            return {
                name: track.name,
                image: track.image,
                artists: track.artists,
                id: track.id,
            };
        }
        catch (err) {
            throw err;
        }
    });
}
exports.fetchTrack = fetchTrack;
function getVideoId(title, artist) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = `${title} ${artist}`;
            const data = yield youtube.GetListByKeyword(query);
            const id = data.items[0].id;
            if (!id)
                throw new Error("no video found");
            return id;
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    });
}
exports.getVideoId = getVideoId;
function downloadSong(title, artist) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = yield getVideoId(title, artist);
            const url = `https://youtube.com/watch?v=${id}`;
            const videoInfo = yield ytdl_core_1.default.getInfo(url);
            let audioFormat = ytdl_core_1.default
                .filterFormats(videoInfo.formats, "audio")
                .find((format) => format.container === "mp4");
            if (!audioFormat) {
                throw new Error("Audio format not available");
            }
            audioFormat.quality = "highestaudio";
            const audioStream = (0, ytdl_core_1.default)(url, { format: audioFormat });
            const filePath = path_1.default.join(__dirname, "tmp", `${title.replace(" ", "-")}-${artist.replace(" ", "-")}.mp3`);
            yield new Promise((resolve, reject) => {
                audioStream
                    .pipe(fs_1.default.createWriteStream(filePath))
                    .on("finish", () => {
                    resolve();
                })
                    .on("error", (error) => {
                    reject(error);
                });
            });
            return filePath;
        }
        catch (error) {
            console.error("Error while downloading song:", error);
            throw error;
        }
    });
}
exports.downloadSong = downloadSong;
function encodeString(str) {
    const bufferData = Buffer.from(str, "utf-8");
    const buffer64 = bufferData.toString("base64");
    return buffer64;
}
exports.encodeString = encodeString;
