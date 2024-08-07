<script lang="ts">
  export let style = "";
</script>

<div class="container" {style}>
  <slot />
</div>

<style lang="scss">
  .container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    // width: min(90%, 1100px);

    padding: 2em;

    border: 2px solid #222222;
    border-radius: 8pt;

    overflow: hidden;
  }
</style>
