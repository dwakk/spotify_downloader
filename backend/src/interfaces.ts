export interface PlaylistContent {
  name: string,
  image: SpotifyApi.ImageObject[],
  author: string,
  tracks: SpotifyApi.PagingObject<SpotifyApi.PlaylistTrackObject>,
  total: number,
  id: string,
}

export interface AlbumContent {
  name: string,
  image: SpotifyApi.ImageObject[],
  artists: {name: string}[],
  tracks: SpotifyApi.PagingObject<SpotifyApi.TrackObjectSimplified>,
  total: number,
  id: string,
  release_date: string,
}

export interface TrackContent {
  name: string,
  artists: {name: string}[],
  image: SpotifyApi.ImageObject[],
  id: string,
}