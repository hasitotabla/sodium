<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Fa from "svelte-fa";
  import { faBars } from "@fortawesome/free-solid-svg-icons";
  import { sha256 } from "js-sha256";

  import DesktopNavbar from "./DesktopNavbar.svelte";
  import { userStore } from "src/stores/User";
  import MobileNavbar from "./MobileNavbar.svelte";
  import { PermissionLevel } from "$shared/index";
  import { addNavigationChangeListener } from "$lib/navigation";

  let isMobileToggled = false;

  let userEmail = "";
  let avatarUrl = "";
  let isAdmin = false;
  userStore.subscribe((user) => {
    userEmail = user?.email || "";
    isAdmin = user?.permission === PermissionLevel.ADMIN;
    avatarUrl = avatarUrl = user?.email ? `https://www.gravatar.com/avatar/${sha256(user.email)}?d=identicon` : "";
  });

  const onToggle = () => {
    isMobileToggled = !isMobileToggled;
  };

  let detectionHandle: ReturnType<typeof addNavigationChangeListener> | null = null;
  const onPathChange = () => {
    isMobileToggled = false;
  };

  // @ts-ignore
  onMount(() => (detectionHandle = addNavigationChangeListener(onPathChange)));
  onDestroy(() => detectionHandle && detectionHandle.remove());
</script>

<!-- {JSON.stringify(routes)} -->
<div class="navbar">
  <p class="branding">
    {import.meta.env.SHARED_APP_TITLE}
  </p>

  <span class="mobile-toggle" on:click={onToggle} role="presentation">
    <Fa icon={faBars} />
  </span>

  <DesktopNavbar {avatarUrl} {isAdmin} />

  <!-- <div class="routes" use:links>
    <Router>
      <a href="/dashboard" class="route">Home</a>
      <a href="/dashboard/upload" class="route">Upload</a>
      <a href="/dashboard/files" class="route">Files</a>
    </Router>

    <img src={avatarUrl} alt="" class="avatar" />
  </div> -->
</div>

{#if isMobileToggled}
  <MobileNavbar {avatarUrl} {isAdmin} {userEmail} />
{/if}

<style lang="scss">
  $navbarHeight: 54px;

  .navbar {
    width: min(1200px, 90%);
    height: $navbarHeight;

    margin: auto;

    display: flex;
    justify-content: space-between;
    align-items: center;

    // padding: 0 20px;
    box-sizing: border-box;

    // background: rgb(32, 32, 32);
    // color: #ddd;

    .branding {
      font-size: 18px;
    }

    .mobile-toggle {
      display: none;
      font-size: 18px;

      @media (max-width: 768px) {
        display: block;
      }
    }
  }
</style>
