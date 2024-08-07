<script lang="ts">
  import { onMount } from "svelte";
  import { Router, Route, navigate } from "svelte-routing";

  import { type SharedUser } from "$shared/types/User";
  import { PageRouteList, PageRouteReferences, type PageRoute } from "./routes";
  import { userStore } from "./stores/User";

  // Non-route pages
  import NotFound from "./pages/NotFound.svelte";

  // Global components
  import ToastComponent from "$components/_partial/toast/Component.svelte";
  import { fetch } from "$lib/fetch";

  export let url: string;
  let initialized = false;

  onMount(async () => {
    const currentPath = window.location.pathname;
    const page: PageRoute | null = PageRouteReferences[currentPath];

    let isLoggedIn = false;
    let user: SharedUser | null = null;

    const response = await fetch("/users/me");
    if (response.status !== 401 && response.data?.id) {
      isLoggedIn = true;
      user = response.data;

      userStore.set(response.data);
    }

    if (!isLoggedIn && (page?.loginRequired === true || page?.requiredRoles !== undefined)) {
      navigate("/dashboard/auth");
    }

    if (isLoggedIn && currentPath === "/dashboard/auth") {
      navigate("/dashboard");
    }

    if (page?.requiredRoles && (!user?.permission || !page.requiredRoles.some((x) => x === user.permission))) {
      navigate("/dashboard");
    }

    document.title = `${page?.displayAs ? `${page?.displayAs} - ` : ""}${import.meta.env.SHARED_APP_TITLE}`;
    initialized = true;
  });
</script>

{#if initialized}
  <ToastComponent />

  <Router {url}>
    {#each PageRouteList as { path, component }}
      {#if path.at(0) !== ":"}
        <Route {path} {component} />
      {:else}
        <Route {path} let:params>
          <svelte:component this={component} {...params} />
        </Route>
      {/if}
    {/each}

    <Route component={NotFound} />
  </Router>
{/if}
