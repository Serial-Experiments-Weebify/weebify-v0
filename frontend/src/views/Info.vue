<template>
    <div v-if="loading">
        <h1>Loading...</h1>
    </div>
    <div v-else-if="!valid">
        <h1>Error</h1>
    </div>
    <div v-else>
        <h1 id="title"><img :src="media?.imageUrl ?? ''" /> {{ media?.name ?? "a" }}</h1>

        <div class="season category" v-for="season in seasons" :key="season.season">
            <h2>Season {{ season.season }}</h2>
            <h3
                class="episode"
                v-for="episode in season.episodes"
                :key="`${episode.season}-${episode.episode}-${
                    episode.extraName ?? ''
                }`"
                @click="() => {goto(episode.season,episode.episode,episode.extraName)}"
            >
                {{
                    `Episode ${episode.episode}${episode.extra ? "." : ""}${
                        episode.extraName ?? ""
                    }`
                }}
            </h3>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    props: ["name"],
    methods: {
        goto(s, e, extra) {
            console.log({s,e,extra});
            this.$router.push({
                name:"WatchEpisode",
                params: {
                    season:s,
                    episode:e,
                    extra
                }
            })
        },
    },
    computed: {
        media() {
            const a = this.$store.getters.getSeasonedMedia(this.name);
            return a;
        },
        seasons() {
            if (!this.media) return [];

            return [...Object.values(this.media.seasons)];
        },
        ...mapState(["loading", "valid"]),
    },
};
</script>

<style>
#title {
    font-size: 3em;
}
#title img {
    height: 8em;
    border-radius: .5em;
}

.episode {
    margin: .1em;
    padding: .6em .3em;
}

.episode:hover {
    background-color: #4BBBEF ;
    border-radius: 1em;
}
</style>
