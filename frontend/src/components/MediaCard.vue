<template>
    <div
        class="media"
        :style="{ backgroundImage: `url('${media.imageUrl}')` }"
        @click="gotoMedia"
    >
        <span class="title">{{ cleanName }}</span>
        <span class="se-number" v-if="media.type === 'multiple'">{{
            totalEpisodes
        }}</span>
    </div>
</template>

<script>
export default {
    props: ["media"],
    computed: {
        totalEpisodes() {
            if (this.media.type !== "multiple") return 1;

            const seasons = [...Object.values(this.media.seasons)];
            const episodes = seasons.reduce((p, c) => p + c.episodes.length, 0);

            return episodes;
        },
        cleanName() {
            return this.media.name.replace(/-/g, " ");
        }
    },
    methods: {
        gotoMedia() {
            if (this.media.type === "multiple") {
                this.$router.push({
                    name: "Info",
                    params: { name: this.media.name },
                });
            } else {
                this.$router.push({
                    name: "Watch",
                    params: { name: this.media.name },
                });
            }
        },
    },
};
</script>

<style scoped>
.media {
    /* height: 10em; */
    /* width: 7em; */
    aspect-ratio: .7;
    position: relative;
    overflow: hidden;
    display: flex;
    background-color: #222;
    border-radius: 0.5em;

    background-size: cover;

    display: flex;
}
.media > .title {
    padding: 0.5em;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #000a;
    backdrop-filter: blur(4px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    color: #fff;
}

.media > .se-number {
    padding: 0.5em;
    position: absolute;
    top: 0;
    right: 0;
    border-bottom-left-radius: 1em;
    background-color: #000a;
    backdrop-filter: blur(4px);
    color: #fff;

    border: 2px solid #4BBBEF;
    border-top: none;
    border-right: none;
}

.media:hover {
    transition: 0.1s linear;
    box-shadow: 2px 2px 6px 2px #4BBBEF;
}

.media:hover > .title {
    transition: 0.1s linear;
    color: #4BBBEF;
}
</style>
