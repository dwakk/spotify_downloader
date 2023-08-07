<template>
  <div class="main-container">
    <div class="mode">
      <label class="switch">
        <input type="checkbox" id="togBtn" :onclick="toggleLightMode">
        <div class="slider round">
          <span language='light' class="on"><font-awesome-icon :icon="['far', 'moon']" size="xl" /></span>
          <span language='night' class="off"><font-awesome-icon :icon="['far', 'sun']" size="lg" /></span>
        </div>
      </label>
    </div>
    <div class="centered-items">
      <h1>Spotify downloader</h1>
      <p class="sub">Download a playlist, song or album</p>
      <div id="link-form">
        <input v-model="link" type="text" id="link" required placeholder="Link" autocomplete="off"
          :aria-invalid="isInvalid" @input="watchInput" />
        <button id="btn" type="submit" :disabled="!isValidLink" :onclick="fetchData">Load {{ cat }}</button>
      </div>
      <div id="result">
        <Result v-for="result in mainObj" :result="result" :download-spotify="downloadSpotify" :key="result.id"></Result>
        <Result v-for="result in resultsArray" :result="result" :download-spotify="downloadSpotify" :key="result.id">
        </Result>
      </div>
      <div id="info">
        <Info :data="objInfo" :spotify="additionalLink"></Info>
      </div>
    </div>
  </div>
</template>
  
<script lang="ts">
import Result from './Result.vue';
import Info from './Info.vue';
import axios from 'axios';
import { decodeString, getSpotifyId, timeConversion, type PlaylistContent, type MainInfo, type MainObject, type Image, type Track } from '@/utils';
import { createToast } from "mosha-vue-toastify"
import "mosha-vue-toastify/dist/style.css"

export default {
  components: {
    Result,
    Info
  },
  data() {
    return {
      cat: null as null | "track" | "album" | "playlist",
      link: '',
      isInvalid: undefined as boolean | undefined,
      mainObj: [] as MainObject[],
      resultsArray: [] as Track[],
      objInfo: {} as MainInfo,
      additionalLink: undefined as string | undefined,
      isDownloading: false
    };
  },
  setup() {

  },
  computed: {
    isValidLink(): boolean {
      const regex = /^https:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(album|track|playlist)\/([a-zA-Z0-9]+)(\?[a-zA-Z0-9_=-]+)?$/;
      const matches = this.link.match(regex);
      if (matches && matches[1] && matches[2]) {
        const type = matches[1];
        const id = matches[2];
        console.log("Valid Spotify link with ID:", id, "of type:", type);
        return true;
      }
      console.log("Not a valid Spotify link.");
      return false;
    }



  },
  watch: {
    link() {
      if (this.isValidLink) {
        this.isInvalid = false;
        this.cat = this.getCategory()
      }
      else if (this.link == "") {
        this.isInvalid = undefined;
        const btn = document.getElementById("btn") as HTMLButtonElement;
        btn.innerText = "Load"
      }
      else {
        this.isInvalid = true;
        const btn = document.getElementById("btn")
        if (btn) {
          btn.innerText = "Load"
        }
      }
    }
  },
  methods: {
    getCategory() {
      let category: "playlist" | "album" | "track" | null;
      switch (true) {
        case this.link.includes("playlist"):
          category = "playlist";
          break;
        case this.link.includes("album"):
          category = "album";
          break;
        case this.link.includes("track"):
          category = "track";
          break;
        default:
          category = null;
          break;
      }
      return category;
    },
    async fetchData() {
      try {
        this.mainObj = [];
        this.resultsArray = [];
        this.objInfo = {} as MainInfo;
        this.additionalLink = undefined
        const category = this.getCategory()
        const id = getSpotifyId(this.link)
        if (!id) throw new Error("No id found")
        axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL

        const btn = document.getElementById("btn") as HTMLButtonElement;
        btn.textContent = "Loading...";
        setTimeout(() => {
          const res = document.getElementById("result");
          if (res) {
            res.scrollIntoView({ behavior: "smooth" })
            btn.textContent = `Loaded ${this.cat}`
          }
        }, 1500)

        const response = await axios.get(`/api/info?type=${category}&id=${id}`)

        if (category === "album") {
          
          const { name, image, tracks, total, id, release_date, artists } = response.data as MainInfo;
          if (!artists) throw new Error("No artist")
          if (typeof artists === "string") throw new Error("Invalid artist type")
          if (!release_date) throw new Error("no release date")
          this.objInfo.name = name;
          this.objInfo.artists = artists[0].name
          this.objInfo.by = "by"
          this.objInfo.release_date = `Released on ${new Date(release_date).toLocaleDateString("fr")}`
          this.objInfo.total = `Total tracks: ${total}`
          this.objInfo.spotify = `View the album on Spotify`;
          this.additionalLink = `https://open.spotify.com/album/${id}`
          console.log(this.objInfo)
          this.mainObj.push({ name, imageSource: image[1].url, total: `Total: ${total} tracks`, category, id, artist: `by ${artists[0].name}`, folder: "zip" })
          for (const track of tracks.items) {
            const { name, artists, id, duration_ms } = track as Track
            if (typeof artists === "string") throw new Error
            let songArtists: string = "";
            if (artists.length < 1) throw new Error(`No artist for track ${name}`)
            else if (artists.length === 1) {
              songArtists += ` ${artists[0].name}`
            } else if (artists.length > 1) {
              for (let i = 0; i < artists.length; i++) {
                if (i === artists.length - 1) {
                  songArtists += ` and ${artists[i].name}`
                } else {
                  songArtists += ` ${artists[i].name}`
                }
              }
            }
            this.resultsArray.push({ name, artists: `by${songArtists}`, imageSource: null, id, duration_ms, category: "track" })
          }
          createToast('Album loaded',
            {
              timeout: 5000,
              position: 'top-right',
              type: 'info',
              showIcon: true,
            })
        } else if (category === "playlist") {
          const { name, image, tracks, total, id, release_date, author } = response.data as MainInfo;
          this.objInfo.name = name;
          this.objInfo.author = author
          this.objInfo.by = "by"
          this.objInfo.total = `Total tracks: ${total}`
          this.objInfo.spotify = `View the playlist on Spotify`;
          this.additionalLink = `https://open.spotify.com/playlist/${id}`
          this.mainObj.push({ name, imageSource: image[0].url, total: `Total: ${total} tracks`, category, id, artist: `by ${author}`, folder: "zip" })
          for (const track of tracks.items) {
            const t = track as {track: Track}
            const { name, artists, id, duration_ms, imageSource } = t.track
            if (typeof artists === "string") throw new Error
            let songArtists: string = "";
            if (artists.length < 1) throw new Error(`No artist for track ${name}`)
            else if (artists.length === 1) {
              songArtists += ` ${artists[0].name}`
            } else if (artists.length > 1) {
              for (let i = 0; i < artists.length; i++) {
                if (i === artists.length - 1) {
                  songArtists += ` and ${artists[i].name}`
                } else {
                  songArtists += ` ${artists[i].name}`
                }
              }
            }
            this.resultsArray.push({ name, artists: `by${songArtists}`, imageSource, id, duration_ms, category: "track" })
          }
          createToast('Playlist loaded',
            {
              timeout: 5000,
              position: 'top-right',
              type: 'info',
              showIcon: true,
            })
        }
        else if (category === "track") {
          const {artists} = response.data as MainInfo
        }
      } catch (err) {
        createToast({
          title: "An error occured",
        },
            {
              timeout: 5000,
              position: 'top-right',
              type: 'danger',
              showIcon: true,
            })
        console.error(err)
      }
    },
    toggleLightMode() {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      if (currentTheme === "light") {
        setTimeout(() => {
          document.documentElement.setAttribute("data-theme", "dark");
        }, 50);
      }
      else if (currentTheme === "dark") {
        setTimeout(() => {
          document.documentElement.setAttribute("data-theme", "light");
        }, 50);
      }
    },
    watchInput() {
      if (this.link === "") {
        this.isInvalid = undefined;
      }
    },
    async downloadSpotify(id: string, category: string) {
      console.log(`category: ${category}\nid: ${id}`)
      try {
        this.isDownloading = true;
        const buttons = document.getElementsByTagName("button")
        for (const button of buttons) {
          button.disabled = true
        }
        axios.defaults.baseURL = 'http://localhost:3000';
        const response = await axios.get(`/api/${category}?id=${id}`, {
          responseType: "blob",
        });
        let name: string;
        let artist: string | null;
        switch (category) {
          case "playlist":
            name = decodeString(response.headers["x-name"]);
            artist = null;
            break;
          default:
            name = decodeString(response.headers["x-name"]);
            artist = decodeString(response.headers["x-artist"]);
            break;
        }
        const contentDisposition: string = response.headers["content-disposition"];
        const parts = contentDisposition.split('; ');
        const contentPart = parts.find((part) => part.startsWith('filename='));
        const contentName = contentPart ? contentPart.split('=')[1] : null;
        let extension = contentName?.split(".")[1];
        const last = extension?.lastIndexOf('\\');
        if (!last)
          throw new Error("No extension");
        extension = extension?.slice(last + 1).replace("\"", "");
        let filename: string;
        if (this.cat === "track") {
          filename = `${name}-${artist}.${extension}`;
        }
        else if (this.cat === "album") {
          filename = `${name}-${artist}`;
        }
        else {
          filename = `${name}`;
        }
        console.log(`Downloading ${filename}`);
        if (!filename)
          throw new Error("no filename");
        const anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(response.data);
        anchor.download = filename.replace(/"/g, '');
        anchor.click();
        createToast({
          title: `${name} downloaded`,
        },
            {
              timeout: 5000,
              position: 'top-right',
              type: 'info',
              showIcon: true,
            })
        URL.revokeObjectURL(anchor.href);
        this.link = "";
        this.isInvalid = undefined;
        this.isDownloading = false;
        setTimeout(() => {
          for (const button of buttons) {
            if (button.id === "btn") continue;
            button.disabled = false;
          }
        }, 2000)
      }
      catch (e) {
        console.error(e);
        createToast({
          title: "An error occured",
        },
            {
              timeout: 5000,
              position: 'top-right',
              type: 'danger',
              showIcon: true,
            })
      }
    },
  },
  mounted() {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100)
  },
};
</script>