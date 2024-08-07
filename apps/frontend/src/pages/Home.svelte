<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import axios from "axios";
  import { faArrowRightToBracket } from "@fortawesome/free-solid-svg-icons";

  import Link from "$components/_partial/Link.svelte";

  import { type IStats } from "$shared/types/Stats";
  import { nFormatter } from "$lib/number";
  import { getInterpFunction, interp } from "$lib/interp";
  import { userStore } from "src/stores/User";
  import { convertFileSize } from "$lib/file";
  import { fetch } from "$lib/fetch";

  const statsLabels: Record<keyof IStats, string> = {
    users: "Users",
    uploads: "Uploads",
    views: "Views",
    totalSpaceUsed: "Total Space Used",
  };

  let stats: IStats<string> | null = null;
  let isLoggedIn = false;

  userStore.subscribe((value) => (isLoggedIn = value !== null));

  const UPDATE_ANIMATION_TIME = 5000;
  let startedAt = 0;
  let updateInterval = -1;

  const updateStats = (animStats: IStats) => {
    const now = Date.now();

    const progress = Math.min((now - startedAt) / UPDATE_ANIMATION_TIME, 1);
    if (progress >= 1) {
      clearInterval(updateInterval);
      return;
    }

    // prettier-ignore
    const [users, uploads, views, totalSpaceUsed] = interp(
      "outQuart", progress,
      0, animStats.users, 0, animStats.uploads,
      0, animStats.views, 0, animStats.totalSpaceUsed
    );

    stats = {
      users: nFormatter(Math.ceil(users), 2),
      uploads: nFormatter(Math.ceil(uploads), 2),
      views: nFormatter(Math.ceil(views), 2),
      totalSpaceUsed: convertFileSize(totalSpaceUsed),
    };
  };

  onMount(async () => {
    if (import.meta.env.SHARED_DISPLAY_STATS !== "true") return;

    const response = await fetch<IStats>("/stats");
    if (response.status !== 200 || !response.success || !response?.data) return;

    // updateStats(response.data);
    startedAt = Date.now();
    updateInterval = setInterval(() => updateStats(response.data), 25);
  });

  $: statsList = Object.entries(stats ?? []) as unknown as [keyof IStats, string];
</script>

{#if import.meta.env.SHARED_DISPLAY_STATS !== "true" || stats !== null}
  <div class="container" transition:fade={{ duration: 500, easing: getInterpFunction("outQuad") }}>
    <h1 class="header">{import.meta.env.SHARED_APP_TITLE}</h1>
    <p class="description">A self-hostable file sharing service, built with Svelte and Nest.js.</p>

    <div class="actions">
      <Link href={isLoggedIn ? "/dashboard" : "/dashboard/auth"} icon={faArrowRightToBracket}>Go to Dashboard</Link>
    </div>

    {#if stats !== null}
      <div class="stats">
        {#each statsList as [key, value]}
          <div class="stat">
            <div class="value">{value}</div>
            <div class="key">{statsLabels[key] || key}</div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<div class="footer">
  Made by <Link href="https://www.github.com/szkiddaj" useAnchor>szkiddaj</Link> with ❤️ |
  <Link href="https://www.github.com/szkiddaj/sodium" useAnchor>GitHub</Link>
</div>

<style lang="scss">
  .container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: min(90%, 400px);

    .header {
      font-size: 2.5rem;
      font-weight: 200;

      text-align: center;
    }

    .description {
      font-size: 13px;
      text-align: center;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .stats {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 2rem;

      .value,
      .key {
        text-align: center;
      }

      .key {
        font-size: 13px;
        color: #666;
      }
    }
  }

  .footer {
    position: absolute;
    bottom: 1em;
    left: 50%;
    transform: translateX(-50%);

    width: 100%;

    text-align: center;

    font-size: 13px;
    color: #666;
  }
</style>
