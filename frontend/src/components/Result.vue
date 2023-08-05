<template>
    <article>
      <img :src="result?.imageSource" />
      <h2>{{ result?.name }}</h2>
      <p>{{ result?.total }}</p>
      <p>{{ result?.artists }}</p>
      <p>{{ result?.author }}</p>
      <footer>
        <button @click="clickWrapper(result?.id, result?.category)">
          <font-awesome-icon
            :icon="iconName"
            :class="{ 'spin': isDownloading }"
            class="dl-icon"
          />
          Download {{ result?.folder }}
        </button>
      </footer>
    </article>
  </template>
  
  <script lang="ts">
  export default {
    name: "Result",
    props: {
      result: Object,
      downloadSpotify: Function,
    },
    data() {
      return {
        isDownloading: false,
        iconName: ["fas", "download"],
      };
    },
    methods: {
      async clickWrapper(id: string, category: string) {
        console.log(`from result\nid: ${id} category: ${category}`);
        if (!this.isDownloading) {
          this.isDownloading = true;
          this.iconName = ["fas", "spinner"];
          try {
            if (this.downloadSpotify)
            await this.downloadSpotify(id, category);
          } catch (error) {
            console.error(error);
          }
          this.isDownloading = false;
          this.iconName = ["fas", "download"];
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  </style>
  