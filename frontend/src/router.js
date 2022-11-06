import { createRouter, createWebHistory } from "vue-router";

import Home from "./views/Home.vue";
import Watch from "./views/Watch.vue";
import Info from "./views/Info.vue";
import DetailedView from "./views/DetailedView.vue";

const routes = [
    { path: "/", component: Home },
    { props: true, name: "Info", path: "/v/:name", component: DetailedView },
    // {
    //     props: true,
    //     name: "Info",
    //     path: "/v/:name",
    //     component: Info,
    // },
    {
        props: true,
        name: "Watch",
        path: "/w/:name",
        component: Watch,
    },
    {
        props: true,
        name: "WatchEpisode",
        path: "/w/:name/s/:season/e/:episode/:extra?/",
        component: Watch,
    },
];

const r = createRouter({
    history: createWebHistory(),
    routes,
});

export default r;
