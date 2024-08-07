import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tsconfigPaths from "vite-tsconfig-paths";

const envPrefixes = ["VITE_", "SHARED_"];

export default defineConfig(({ mode }) => {
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd(), envPrefixes),
  };

  return {
    plugins: [tsconfigPaths(), svelte()],
    envPrefix: envPrefixes,
    envDir: "../../",
  };
});
