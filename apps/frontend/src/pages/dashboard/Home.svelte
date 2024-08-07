<script lang="ts">
  import { onMount } from "svelte";
  import preset from "@bbob/preset-html5";
  import html from "@bbob/html";

  import DashboardPage from "$components/_partial/DashboardPage.svelte";
  import { fetch } from "$lib/fetch";
  import type { SharedUser } from "$shared/index";
  import { userStore } from "src/stores/User";

  let user: SharedUser | null = null;
  userStore.subscribe((val) => (user = val));

  let pageContent = ``;

  onMount(async () => {
    const response = await fetch<string>("/settings/get?key=home_page_content");
    if (!response.success) {
      pageContent = "Failed to load content";
      return;
    }

    pageContent = response.data.replace(/{{\s?\.([a-zA-Z0-9]+)\s?}}/gm, (_, key: keyof SharedUser) => user?.[key].toString() ?? "");
  });

  const createPreset = preset.extend((defTags) => {
    return {
      ...defTags,
      avatar: (node) => {
        return {
          ...node,
          tag: "bb-avatar",
        };
      },
    };
  });

  $: parsedContent = html(pageContent, createPreset());
</script>

<DashboardPage>
  <div class="content">
    <p>{@html parsedContent}</p>
  </div>
</DashboardPage>

<style lang="scss">
  .content {
    width: min(1100px, 90%);
    margin: 2em auto;
  }
</style>
