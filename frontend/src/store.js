import { createStore } from "vuex";

const store = createStore({
    state: {
        valid: true,
        loading: true,
        seasoned: {},
        unseasoned: {},
    },
    mutations: {
        setContent(state, { seasoned, unseasoned }) {
            state.seasoned = seasoned;
            state.unseasoned = unseasoned;
        },
        valid(state) {
            state.loading = false;
            state.valid = true;
        },
        invalid(state) {
            state.loading = false;
            state.valid = false;
        },
        loading(state) {
            state.loading = false;
            state.valid = true;
        },
    },
    actions: {
        async fetchLibrary({ commit, state }) {
            commit("loading");
            try {
                const media = await fetch(`${import.meta.env.VITE_API}/media`);

                commit("setContent", await media.json());
                commit("valid");
            } catch (e) {
                commit("invalid");
                console.error(e);
            }
        },
    },
    getters: {
        allMediaArray(state) {
            return [
                ...Object.values(state.seasoned),
                ...Object.values(state.unseasoned),
            ];
        },
        unseasonedMediaArray(state) {
            return Object.values(state.unseasoned);
        },
        seasonedMediaArray(state) {
            return Object.values(state.seasoned);
        },
        getSeasonedMedia(state) {
            return (name) => state.seasoned[name];
        },
        getUnseasonedMedia(state) {
            return (name) => state.unseasoned[name];
        },
        getMedia(state) {
            return (name) => state.seasoned[name] ?? state.seasoned[name]; // maybe not the greatest idea ever?
        },
    },
});

export default store;
