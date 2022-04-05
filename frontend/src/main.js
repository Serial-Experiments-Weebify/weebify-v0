import { createApp } from "vue";
import router from "./router";
import store from "./store";
import App from "./App.vue";

import "./assets/style.less";

const app = createApp(App);
app.use(router);
app.use(store);
store.dispatch('fetchLibrary')
app.mount("#app");
