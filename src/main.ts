import { createApp } from "vue";
import App from "./App.vue";
import "./styles/mug.scss";

import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useBeverageStore } from "./stores/beverageStore";

async function bootstrap() {
  const app = createApp(App);

  const pinia = createPinia();
  pinia.use(piniaPluginPersistedState);
  app.use(pinia);

  const beverageStore = useBeverageStore();

  onAuthStateChanged(auth, (user) => {
    beverageStore.setUser(user);
  });

  await beverageStore.init();

  app.mount("#app");
}

bootstrap();