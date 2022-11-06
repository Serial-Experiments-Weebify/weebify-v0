<template>
    <div v-if="loading">
        <h1>Loading...</h1>
    </div>
    <div v-else-if="!valid">
        <h1>Error</h1>
    </div>
    <div class="watch" v-else>
        <h1>{{ cleanName }}</h1>
        <div class="video-group">

            <div id="video">
                <video controls :src="video?.publicUrl"></video>
                <div class="episode-indicator">
                    <button id="prev-ep" :disabled="!prevEp" @click="
                        () => {
                            goto(prevEp);
                        }
                    ">
                        &lt; Previous
                    </button>
                    <span id="ep-tag">{{ episodeTag }}</span>
                    <button id="next-ep" :disabled="!nextEp" @click="
                        () => {
                            goto(nextEp);
                        }
                    ">
                        Next &gt;
                    </button>
                </div>
            </div>
            <div class="links">
                <a class="video-link" :href="video?.publicUrl">Video link</a>
                <send-to-sync :url="video?.publicUrl" />
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import SendToSync from "../components/SendToSync.vue";

export default {
    components: {
        SendToSync
    },
    props: ["name", "season", "episode", "extra"],
    methods: {
        goto(ep) {
            const { season, episode } = ep;
            let extra = undefined;
            if (ep.extra) extra = ep.extraName;

            this.$router.replace({
                name: "WatchEpisode",
                params: {
                    season,
                    episode,
                    extra,
                },
            });
        },
    },
    computed: {
        media() {
            if (
                typeof this.season !== "string" ||
                typeof this.season !== "string"
            ) {
                // single media thing
                return this.$store.getters.getUnseasonedMedia(this.name);
            }
            return this.$store.getters.getSeasonedMedia(this.name);
        },
        video() {
            if (!this.media) return "";
            if (this.media.type === "single") {
                return this.media.video;
            } else {
                if (!!this.extra) {
                    return this.media.seasons[
                        parseInt(this.season)
                    ].episodes.find(
                        (ep) =>
                            ep.episode === parseInt(this.episode) &&
                            ep.extraName === this.extra
                    );
                } else {
                    return this.media.seasons[
                        parseInt(this.season)
                    ].episodes.find(
                        (ep) => ep.episode === parseInt(this.episode)
                    );
                }
            }
        },
        cleanName() {
            return this.name.replace(/-/g, " ");
        },
        episodeTag() {
            if (!this.video) return "";
            if (this.media.type === "single") return this.media.name;

            return `S${this.video.season}E${this.video.episode}${this.video.extra ? `.${this.video.extraName}` : ""
                }`;
        },
        allEpisodes() {
            if (!this.media) return;
            if (this.media.type === "single") return null;

            return Object.values(this.media.seasons)
                .map((x) => x.episodes)
                .flat()
                .reduce((all, ep) => [...all, ep], [])
                .sort((a, b) => {
                    const sDiff = a.season - b.season;
                    if (sDiff !== 0) return sDiff;

                    const eDiff = a.episode - b.episode;
                    if (eDiff !== 0) return eDiff;

                    const ex1Diff = a.extra - 0 - (b.extra - 0); // extras come after their 'base' episode
                    if (ex1Diff !== 0) return ex1Diff;

                    return a.extraName.localeCompare(b.extraName); //sort extras by name
                });
        },
        currentIndex() {
            if (!this.media) return -1;
            if (this.media.type === "single") return -1;

            return this.allEpisodes.indexOf(this.video);
        },
        prevEp() {
            if (!this.media) return;
            if (this.media.type === "single") return null;

            const index = this.currentIndex;
            if (index === -1) return null;

            return this.allEpisodes[index - 1];
        },
        nextEp() {
            if (!this.media) return;
            if (this.media.type === "single") return null;

            const index = this.currentIndex;
            if (index == -1) return null;

            return this.allEpisodes[index + 1];
        },
        ...mapState(["loading", "valid"]),
    },
};
</script>

<style lang="less">
.watch {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    .links {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-top: 1rem;
        // .video-link {
        //     margin-top: 1rem;
        // }
    }
    .video-link {
        display: block;
        margin: .5rem;
        color: #5abeed;
    }

    #video {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        background-color: #000;

        width: 95vw;

        video {
            max-height: 80vh;
        }

        .episode-indicator {
            display: flex;
            flex-direction: row;
            justify-content: space-evenly;
            align-items: center;

            #ep-tag {
                height: fit-content;
            }

            button {
                padding: .5em;
                border: none;
                outline: none;
                background: none;

                color: #fff;
                font-weight: bold;
                font-size: initial;

                &:hover {
                    color: #4bbbef;
                }

                &:disabled {
                    color: #888;
                }
            }
        }
    }
}
</style>
