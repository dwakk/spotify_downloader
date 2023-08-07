<template>
    <h2>{{ data?.name }} {{ data?.by }} {{ data?.artists || data?.author }}</h2>
    <p>{{ data?.release_date }}</p>
    <p>{{ data?.total }}</p>
    <a :href="spotify" target="_blank">{{ data?.spotify }}</a>
</template>

<script lang="ts">
    export default {
        name: "Info",
        props: {
            data: Object,
            spotify: String,
        }
    }
</script>