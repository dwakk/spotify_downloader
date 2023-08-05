export class Playlist {
    name: string
    image: SpotifyApi.ImageObject[]
    author: string
    tracks: SpotifyApi.PagingObject<SpotifyApi.PlaylistTrackObject>
    total: number
    id: string
    constructor(playlist: SpotifyApi.SinglePlaylistResponse) {
        this.name = playlist.name
        this.image = playlist.images
        this.author = playlist.owner.display_name ? playlist.owner.display_name : "User not found"
        this.tracks = playlist.tracks
        this.total = playlist.tracks.total
        this.id = playlist.id
    }
}


export class Album {
    name: string
    image: SpotifyApi.ImageObject[]
    artists: {name: string}[]
    tracks: SpotifyApi.PagingObject<SpotifyApi.TrackObjectSimplified>
    total: number
    id: string
    release_date: string
    constructor(album: SpotifyApi.SingleAlbumResponse) {
        this.name = album.name
        this.image = album.images
        this.artists = album.artists
        this.tracks = album.tracks
        this.total = album.total_tracks
        this.id = album.id
        this.release_date = album.release_date
    }
}

export class Track {
    name: string
    artists: {name: string}[]
    image: SpotifyApi.ImageObject[]
    id: string
    constructor(track: SpotifyApi.TrackObjectFull) {
        this.name = track.name
        this.artists = track.artists
        this.image = track.album.images
        this.id = track.id
    }
}