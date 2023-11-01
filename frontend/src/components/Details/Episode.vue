<template>
    <div class="details-episode" @click="goto(season, episode, extra)">
        <span class="tag">{{ tag }}</span>
        <span class="title">{{ title }}</span>
        <div class="spacer"></div>
        <div class="indicator" :style="indicatorStyle"></div>
        <!-- <span class="length">{{ toTime(length) }}</span> -->
    </div>
</template>

<script>
function padNumber(n, l) {
    const string = n.toString();
    if (string.length >= l) return string;
    return `${"0".repeat(l - string.length)}${string}`;
}

export default {
    props: ["season", "episode", "extra", "title", "length", "progress"],
    computed: {
        tag() {
            let tag = `S${padNumber(this.season, 2)}E${padNumber(
                this.episode,
                2
            )}`;

            if (
                typeof this.extra === "string" ||
                typeof this.extra === "number"
            ) {
                tag += `.${this.extra}`;
            }
            return tag + " ";
        },
        indicatorStyle() {
            return {
                display: "none",
            };
        },
    },

    methods: {
        toTime(n) {
            const h = Math.floor(n / 3600);
            n %= 3600;
            const m = Math.floor(n / 60);
            n %= 60;
            const s = n;

            return `${h > 0 ? `${h}:` : ""}${
                h > 0 ? padNumber(m, 2) : m
            }:${padNumber(s, 2)}`;
        },
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
};
</script>

<style lang="less">
.details-episode {
    display: flex;
    position: relative;
    flex-direction: row;
    align-items: center;
    padding: 0.7em;
    border-radius: 0.5em;
    color: #fff;
    gap: 0.5em;
    cursor: pointer;

    overflow: hidden;

    .tag {
        font-weight: 700;
    }

    .spacer {
        flex: 1;
    }

    .indicator {
        position: absolute;

        bottom: 0;
        left: 0;
        height: 2px;

        box-shadow: #4bbbef 0 0 9px 1px;

        background-color: #4bbbef;
    }
    &:hover {
        transition: 0.2s ease-out;
        background-color: #4bbbef;
    }
}
</style>
