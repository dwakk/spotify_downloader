"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Track = exports.Album = exports.Playlist = void 0;
class Playlist {
    constructor(playlist) {
        this.name = playlist.name;
        this.image = playlist.images;
        this.author = playlist.owner.display_name ? playlist.owner.display_name : "User not found";
        this.tracks = playlist.tracks;
        this.total = playlist.tracks.total;
        this.id = playlist.id;
    }
}
exports.Playlist = Playlist;
class Album {
    constructor(album) {
        this.name = album.name;
        this.image = album.images;
        this.artists = album.artists;
        this.tracks = album.tracks;
        this.total = album.total_tracks;
        this.id = album.id;
        this.release_date = album.release_date;
    }
}
exports.Album = Album;
class Track {
    constructor(track) {
        this.name = track.name;
        this.artists = track.artists;
        this.image = track.album.images;
        this.id = track.id;
    }
}
exports.Track = Track;
