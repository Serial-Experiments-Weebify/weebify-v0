<template>
    <div v-if="loading">
        <h1>Loading...</h1>
    </div>
    <div v-else-if="!valid">
        <h1>Error</h1>
    </div>
    <div v-else id="detailed-view">
        <div id="bg" :style="bgStyle"></div>
        <div id="top">
            <img id="thumbnail" :src="media?.imageUrl ?? ''" />
            <div class="metadata">
                <h1>{{ cleanTitle }}</h1>
                <div class="tags">
                    <span class="tag" v-for="(tag, index) in tags" :key="index">{{ tag }}</span>
                </div>
                <weebify-text :maxLines="3" :text="description" />
            </div>
        </div>
        <div id="episodes">
            <div class="season" v-for="season in seasons" :key="season.season">
                <h2>
                    Season {{ season.season
                    }}{{ season.title ? ` - ${season.title}` : "" }}
                </h2>
                <episode v-for="(ep, index) in season.episodes" :key="index" :season="ep.season" :episode="ep.episode"
                    :extra="ep.extraName" :title="ep.title ?? cleanTitle" :length="ep.length" :progress="ep.progress" />
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import WeebifyText from "../components/Details/WeebifyText.vue";
import Episode from "../components/Details/Episode.vue";

export default {
    components: {
        WeebifyText,
        Episode,
    },
    props: ["name"],
    data() {
        return {
            description: `No description available.`,
            tags: ["H.264","AAC","Burned subs"],
        };
    },
    computed: {
        media() {
            return this.$store.getters.getSeasonedMedia(this.name);
        },
        seasons() {
            if (!this.media) return [];

            return [...Object.values(this.media.seasons)];
        },
        cleanTitle() {
            return this.media?.name?.replace(/-/g, " ") ?? "?";
        },
        bgStyle() {
            return {background: `linear-gradient(to bottom, #14131c00, #14131c), url(\"${ this.media?.imageUrl ?? '' }\")`};
        },
        ...mapState(["loading", "valid"]),
    }
};
</script>

<style lang="less">
@blur-size: 5px;

#detailed-view {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: stretch;

    min-height: 100vh;

    background: linear-gradient(to bottom, #26244000 90%, #26244088 100%);

    > * {
        align-self: center;
    }

    #bg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50vh;

        background: linear-gradient(to bottom, #14131c00, #14131c),
            url("../assets/cover.jpg");
        background-size: cover !important;
        background-position: center !important;

        filter: blur(@blur-size);
        z-index: -10;
    }

    #top {
        width: min(97vw, 150vh);
        display: flex;
        flex-direction: row;
        gap: 2em;
        height: fit-content;

        padding-top: 3em;

        #thumbnail {
            align-self: center;
            // height: 100%;
            object-fit: cover;
            max-width: 33vw;
            max-height: 100%;
            border-radius: 1em;
        }

        .metadata {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;

            gap: 1em;
            padding-block-end: 2em;

            h1 {
                text-shadow: #000f 0 0 @blur-size;
                margin: 0;
                font-size: 4em;
                font-weight: 300;
            }

            .tags {
                display: flex;
                flex-direction: row;
                font-size: 0.8em;
                font-weight: bold;
                gap: 0.5em;
                flex-wrap: wrap;

                .tag {
                    background-color: #4bbbef;
                    padding: 0.3em .5em;
                    border-radius: 1em;
                    white-space: nowrap;
                }
            }
        }
    }

    #episodes {
        max-width: 150vh;
        width: 100%;
        display: grid;
        grid-gap: 3em;
        grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
        margin-bottom: 2rem;

        padding-top: 3em;

        .season {
            padding: 1em;
            border-radius: 1em;
            background-color: #262440;
        }
    }
}

@media only screen and (max-width: 50em) {

    #top {
        flex-direction: column !important;
        align-items: center;
    }

    .metadata {
        text-align: center;
    }

    .tags {
        justify-content: center;
    }
}
</style>
