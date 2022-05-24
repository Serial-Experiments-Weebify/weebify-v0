<template>
    <div v-if="loading">
        <h1>Loading...</h1>
    </div>
    <div v-else-if="!valid">
        <h1>Error</h1>
    </div>
    <div v-else>
        <div id="anime-bar">
            <img :src="media?.imageUrl ?? ''" />
            <h1 id="title">{{ cleanTitle }}</h1>
        </div>

        <div
            class="season category"
            v-for="season in seasons"
            :key="season.season"
        >
            <h2>Season {{ season.season }}</h2>
            <h3
                class="episode"
                v-for="episode in season.episodes"
                :key="`${episode.season}-${episode.episode}-${
                    episode.extraName ?? ''
                }`"
                @click="
                    () => {
                        goto(
                            episode.season,
                            episode.episode,
                            episode.extraName
                        );
                    }
                "
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
            console.log({ s, e, extra });
            this.$router.push({
                name: "WatchEpisode",
                params: {
                    season: s,
                    episode: e,
                    extra,
                },
            });
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
        cleanTitle() {
            return this.media?.name?.replace(/-/g, " ") ?? "?";
        },
        ...mapState(["loading", "valid"]),
    },
};
</script>

<style>
#anime-bar {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 1em;
    margin:1em;
}

#title {
    font-size: 2em;
    text-transform: capitalize;
    margin: 0;
}
#anime-bar img {
    height: 15em;
    border-radius: 0.5em;
}
@media screen and (max-width: 800px) {
    #anime-bar {
        flex-direction: column;
        align-items: center;
    }
    #anime-bar > h1 {
        text-align: center;
    }
}

.episode {
    margin: 0.1em;
    padding: 0.6em 0.3em;
}

.episode:hover {
    background-color: #4bbbef;
    border-radius: 1em;
}
</style>
