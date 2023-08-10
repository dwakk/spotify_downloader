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
exports.getGlobalInfo = exports.downloadSingleSong = exports.downloadPlaylist = exports.downloadAlbum = void 0;
require("dotenv").config();
const fs_1 = __importDefault(require("fs"));
const archiver_1 = __importDefault(require("archiver"));
const content_disposition_1 = __importDefault(require("content-disposition"));
const utils_1 = require("./utils");
function downloadAlbum(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.query.id;
            if (typeof id !== "string")
                throw new Error("Id must be a string");
            const { name, tracks, artists } = yield (0, utils_1.fetchAlbum)(id);
            const sanitizedAlbumName = name.replace(" ", "-");
            const zipName = `${sanitizedAlbumName}`;
            const zip = fs_1.default.createWriteStream(zipName);
            const archive = (0, archiver_1.default)("zip");
            archive.pipe(zip);
            const paths = [];
            for (const track of tracks.items) {
                if (!(track === null || track === void 0 ? void 0 : track.name) || !(track === null || track === void 0 ? void 0 : track.artists[0]))
                    continue;
                const artist = track.artists[0];
                if (!artist)
                    continue;
                let filePath;
                try {
                    filePath = yield (0, utils_1.downloadSong)(track.name, artist.name);
                }
                catch (err) {
                    console.error(err);
                    continue;
                }
                paths.push(filePath);
                const filenameArray = filePath.split("\\");
                const filename = filenameArray.pop();
                if (filenameArray.length === 0 || !filename) {
                    console.error("Invalid file path or filename not found.");
                    continue;
                }
                else {
                    const customFilename = `${track.name}_${artist.name}.mp3`.replace(" ", "-");
                    archive.append(fs_1.default.createReadStream(filePath), { name: customFilename });
                }
            }
            archive.finalize();
            zip.on("finish", function () {
                for (const p of paths) {
                    fs_1.default.unlink(p, (err) => {
                        if (err) {
                            console.error("Error while deleting file:", err);
                        }
                    });
                }
                const artist = artists[0].name;
                const base64name = (0, utils_1.encodeString)(zipName);
                const base64artist = (0, utils_1.encodeString)(artist);
                res.setHeader("Content-Type", "application/zip");
                res.setHeader("Content-Disposition", (0, content_disposition_1.default)(zipName + ".zip"));
                res.setHeader("Access-Control-Expose-Headers", "*");
                res.setHeader("X-Name", base64name);
                res.setHeader("X-Artist", base64artist);
                const fileStream = fs_1.default.createReadStream(zip.path);
                fileStream.pipe(res);
                fileStream.on("close", () => {
                    fs_1.default.unlink(zip.path, (err) => {
                        if (err) {
                            console.error("Error while deleting file:", err);
                        }
                    });
                });
            });
        }
        catch (err) {
            res.sendStatus(500);
            console.error(err);
        }
    });
}
exports.downloadAlbum = downloadAlbum;
function downloadPlaylist(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.query.id;
            if (typeof id !== "string" || !id)
                throw new Error("Invalid id");
            const pl = yield (0, utils_1.fetchPlaylist)(id);
            const { name, image, author, tracks, total } = pl;
            const sanitizedPlaylistName = name.replace(" ", "-");
            const zipName = sanitizedPlaylistName + ".zip";
            const zip = fs_1.default.createWriteStream(zipName);
            const archive = (0, archiver_1.default)("zip");
            archive.pipe(zip);
            const paths = [];
            for (const t of tracks.items) {
                if (t.is_local)
                    continue;
                const { track } = t;
                if (!(track === null || track === void 0 ? void 0 : track.name) || !(track === null || track === void 0 ? void 0 : track.artists[0]))
                    continue;
                const artist = track.artists[0];
                if (!artist)
                    continue;
                let filePath;
                try {
                    filePath = yield (0, utils_1.downloadSong)(track.name, artist.name);
                }
                catch (err) {
                    console.error(err);
                    continue;
                }
                paths.push(filePath);
                const filenameArray = filePath.split("\\");
                const filename = filenameArray.pop();
                if (filenameArray.length === 0 || !filename) {
                    console.error("Invalid file path or filename not found.");
                }
                else {
                    const customFilename = `${track.name}_${artist.name}.mp3`.replace(" ", "-");
                    archive.append(fs_1.default.createReadStream(filePath), { name: customFilename });
                }
            }
            archive.finalize();
            zip.on("finish", function () {
                for (const p of paths) {
                    fs_1.default.unlink(p, (err) => {
                        if (err) {
                            console.error("Error while deleting file:", err);
                        }
                    });
                }
                const base64name = (0, utils_1.encodeString)(zipName);
                res.setHeader("Content-Type", "application/zip");
                res.setHeader("Content-Disposition", (0, content_disposition_1.default)(zipName));
                res.setHeader("Access-Control-Expose-Headers", "*");
                res.setHeader("X-Name", base64name);
                const fileStream = fs_1.default.createReadStream(zip.path);
                fileStream.pipe(res);
                fileStream.on("close", () => {
                    fs_1.default.unlink(zip.path, (err) => {
                        if (err) {
                            console.error("Error while deleting file:", err);
                        }
                    });
                });
            });
        }
        catch (err) {
            res.sendStatus(500);
            console.error(err);
        }
    });
}
exports.downloadPlaylist = downloadPlaylist;
function downloadSingleSong(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, utils_1.initializeSpotifyClient)();
            const id = req.query.id;
            if (typeof id !== "string" || !id)
                throw new Error("Invalid id");
            const track = yield utils_1.spotifyApi.getTrack(id);
            const { name, artists, is_local } = track.body;
            const artist = artists[0];
            if (is_local)
                throw new Error("Can't download local tracks");
            const filePath = yield (0, utils_1.downloadSong)(name, artist.name);
            const base64name = (0, utils_1.encodeString)(name);
            const base64artist = (0, utils_1.encodeString)(artist.name);
            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Content-Disposition", (0, content_disposition_1.default)(filePath));
            res.setHeader("Access-Control-Expose-Headers", "*");
            res.setHeader("X-Name", base64name);
            res.setHeader("X-Artist", base64artist);
            const fileStream = fs_1.default.createReadStream(filePath);
            fileStream.pipe(res);
            fileStream.on("end", () => {
                fs_1.default.unlink(filePath, (err) => {
                    if (err) {
                        console.error("Error while deleting file:", err);
                    }
                });
            });
        }
        catch (error) {
            console.error("Error while downloading song:", error);
            res.status(500).send("Error while downloading song");
        }
    });
}
exports.downloadSingleSong = downloadSingleSong;
function getGlobalInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { type, id } = req.query;
            if (!id || typeof id !== "string") {
                throw new Error("Invalid id");
            }
            if (typeof type !== "string" ||
                !["playlist", "album", "track"].includes(type)) {
                throw new Error("Type must be a string");
            }
            let data;
            switch (type) {
                case "playlist": {
                    data = yield (0, utils_1.fetchPlaylist)(id);
                    res.json(data).status(200);
                    break;
                }
                case "track": {
                    data = yield (0, utils_1.fetchTrack)(id);
                    res.json(data).status(200);
                    break;
                }
                case "album": {
                    data = yield (0, utils_1.fetchAlbum)(id);
                    res.json(data).status(200);
                    break;
                }
                default: {
                    res.json({ msg: "not found" }).status(404);
                }
            }
        }
        catch (err) {
            console.error("Error while fetching:", err);
            res.status(500).send("Error while fetching");
        }
    });
}
exports.getGlobalInfo = getGlobalInfo;
