<template>
    <div>
        <h1 id="logo">Weebify v0</h1>
        <div class="category">
            <h2>Seasoned</h2>
            <div class="main-grid">
                <media-card v-for="m in seasoned" :key="m.name" :media="m" />
            </div>
        </div>
        <div class="category">
            <h2>Unseasoned</h2>
            <div class="main-grid">
                <media-card v-for="m in unseasoned" :key="m.name" :media="m" />
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
    computed: {
        ...mapGetters({
            unseasoned: "unseasonedMediaArray",
            seasoned: "seasonedMediaArray",
        }),
    },
};
</script>

<style>
#logo {
    color: #E35E6E;
}

.main-grid {
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: repeat(auto-fill, 7em);
}
</style>
