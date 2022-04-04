<template>
    <div v-if="loading">
        <h1>Loading...</h1>
    </div>
    <div v-else-if="!valid">
        <h1>Error</h1>
    </div>
    <div v-else>
        <h1>{{ formattedName }}</h1>
        <video controls :src="videoUrl"></video>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    props: ["name", "season", "episode", "extra"],
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
        videoUrl() {
            if (!this.media) return "";
            if (this.media.type === "single") {
                return this.media.video.publicUrl;
            } else {
                if (typeof this.extra === "undefined") {
                    return this.media.seasons[
                        parseInt(this.season)
                    ].episodes.find(
                        (ep) =>
                            ep.episode === parseInt(this.episode) &&
                            ep.extraName === this.extra
                    )?.publicUrl;
                } else {
                    return this.media.seasons[
                        parseInt(this.season)
                    ].episodes.find(
                        (ep) => ep.episode === parseInt(this.episode)
                    )?.publicUrl;
                }
            }
        },
        formattedName() {
            let text = this.name;
            if (
                typeof this.season == "string" ||
                typeof this.season == "string"
            ) {
                text += ` S${this.season} E${this.episode}`;
            }
            if (this.extra) {
                text += `.${extra}`;
            }
            return text;
        },
        ...mapState(["loading", "valid"]),
    },
};
</script>

<style>
    video{
        max-height: 80vh;
        width: 95vw;
    }
</style>
