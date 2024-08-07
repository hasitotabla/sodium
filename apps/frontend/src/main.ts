import "./preload";
import "./styles/index.scss";

import App from "./App.svelte";

const app = new App({
  target: document.getElementById("__root__")!,
});

export default app;
