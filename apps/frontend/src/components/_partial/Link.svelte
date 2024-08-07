<script lang="ts">
  import { Link } from "svelte-routing";
  import Fa from "svelte-fa";
  import type { IconDefinition } from "@fortawesome/free-brands-svg-icons";

  type ButtonVariant = "default" | "outline" | "transparent";

  export let href: string = "#";
  export let icon: IconDefinition | null = null;
  export let useAnchor: boolean = false;
</script>

{#if useAnchor}
  <a {...$$props} {href}>
    <slot />

    {#if icon}
      <Fa {icon} />
    {/if}
  </a>
{:else}
  <Link {...$$props} to={href} class="link-wrapper">
    <slot />

    {#if icon}
      <Fa {icon} />
    {/if}
  </Link>
{/if}

<style lang="scss">
  a,
  :global(.link-wrapper) {
    text-decoration: none;
    color: white;

    transition: color 100ms ease-out;

    &:hover {
      color: #888888;
    }
  }
</style>
