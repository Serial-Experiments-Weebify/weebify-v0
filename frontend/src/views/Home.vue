<template>
    <div>
        <div id="logo-bar">
            <img src="../assets/logo.png" alt="" />
            <h1 id="logo">Weebify v0</h1>
            <input
                type="text"
                name="filter"
                id="filter"
                placeholder="filter"
                v-model="filterText"
            />
        </div>
        <div class="category">
            <h2>Seasoned</h2>
            <div class="main-grid">
                <media-card
                    v-for="m in filteredSeasoned"
                    :key="m.name"
                    :media="m"
                />
            </div>
        </div>
        <div class="category">
            <h2>Unseasoned</h2>
            <div class="main-grid">
                <media-card
                    v-for="m in filteredUnseasoned"
                    :key="m.name"
                    :media="m"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import MediaCard from "../components/MediaCard.vue";

export default {
    components: {
        MediaCard,
    },
    data() {
        return {
            filterText: "",
        };
    },
    computed: {
        ...mapGetters({
            unseasoned: "unseasonedMediaArray",
            seasoned: "seasonedMediaArray",
        }),
        filteredSeasoned() {
            if (this.filterText === "") return this.seasoned;

            return this.seasoned.filter((m) =>
                m.name.toLowerCase().includes(this.filterText.toLowerCase())
            );
        },
        filteredUnseasoned() {
            if (this.filterText === "") return this.unseasoned;

            return this.unseasoned.filter((m) =>
                m.name.toLowerCase().includes(this.filterText.toLowerCase())
            );
        },
    },
};
</script>

<style>
@media screen and (max-width: 800px) {
    #logo {
        display: none;
    }
}

#logo {
    color: #e35e6e;
}

#logo-bar {
    margin: 0 1em;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1em;
}
#logo-bar > img {
    height: 3em;
    width: 3em;
}
#filter {
    padding: 0.5em;
    font-size: 1em;
    border-radius: 1em;
}

#filter:hover #filter:active,
#filter:focus {
    border-color: #e35e6e;
}

#filter:not(:placeholder-shown) {
    box-shadow: 0px 0px 3px 2px #e35e6e;
}
.main-grid {
    display: grid;
    grid-gap: 0.5em;
    /* grid-template-columns: repeat(auto-fill, 7em); */
    grid-template-columns: repeat(auto-fill, minmax(10em, 1fr));
}
</style>
