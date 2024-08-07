<script lang="ts">
  import Navbar from "$components/navbar/_Navbar.svelte";
</script>

<Navbar />

<div class="container">
  <slot />
</div>

<style lang="scss">
  .container {
    padding: 0.5em;

    box-sizing: border-box;
  }
</style>
