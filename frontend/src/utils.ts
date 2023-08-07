import { Buffer } from "buffer";

export function decodeString(str: string): string {
  const receivedData = Buffer.from(str, "base64");
  const decodedData = receivedData.toString("utf-8");
  return decodedData;
}

export function getSpotifyId(link: string): string | null {
  const regex =
    /^https:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(album|track|playlist)\/([a-zA-Z0-9]+)(\?[a-zA-Z0-9_=-]+)?$/;
  const matches = link.match(regex);

  if (matches && matches[1] && matches[2]) {
    const type = matches[1];
    const id = matches[2];
    console.log("Valid Spotify link with ID:", id, "of type:", type);
    return id;
  }

  console.log("Not a valid Spotify link.");
  return null;
}

export function timeConversion(duration: number): string {
  const portions: string[] = [];

  const msInHour = 1000 * 60 * 60;
  const hours = Math.trunc(duration / msInHour);
  if (hours > 0) {
    portions.push(hours + "h");
    duration = duration - hours * msInHour;
  }

  const msInMinute = 1000 * 60;
  const minutes = Math.trunc(duration / msInMinute);
  if (minutes > 0) {
    portions.push(minutes + "m");
    duration = duration - minutes * msInMinute;
  }

  const seconds = Math.trunc(duration / 1000);
  if (seconds > 0) {
    portions.push(seconds + "s");
  }

  return portions.join(" ");
}

export interface MainObject {
  artist?: string;
  author?: string;
  folder: string;
  name: string;
  imageSource: string;
  total: string;
  category: string;
  id: string;
}

export interface Image {
  height: number;
  url: string;
  width: number;
}

/*
export interface PlaylistContent {
  name: string;
  image: Image[];
  author: string;
  tracks: ;
  total: number;
  id: string;
}
*/

export interface Track {
  name: string;
  artists: { name: string }[] | string;
  imageSource?: string | null;
  image?: { url: string }[];
  id: string;
  duration_ms: number;
  category: "track" | "playlist" | "album";
}

export interface MainInfo {
  image: Image[];
  name: string;
  artists?: { name: string }[] | string;
  total: string;
  release_date?: string;
  spotify: string;
  by: "by";
  author?: string;
  tracks:
    | {
        items: Track[];
      }
    | {
        items: Array<{
          track: Track;
        }>;
      };
  id: string;
}

export interface PlaylistContent {
  name: string;
  image: Image[];
  owner: string;
  tracks: Track[];
  release_date?: string;
  total?: number;
  id: string;
}
