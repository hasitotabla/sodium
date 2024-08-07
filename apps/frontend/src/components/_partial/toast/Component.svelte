<script lang="ts">
  import { _toastStore, type Toast } from "./_Toast";

  let toasts: { [key: number]: Toast } = {};
  _toastStore.subscribe((val) => (toasts = val));

  const forceClose = (toastId: string) => {
    const id = parseInt(toastId);

    _toastStore.update((val) => {
      delete val[id];
      return val;
    });
  };
</script>

{#each Object.entries(toasts) as [id, toast]}
  <div class="toast" on:click={() => forceClose(id)} role="presentation">
    <div class="content">
      {toast.message}
    </div>

    <div class="close">x</div>
  </div>
{/each}

<style lang="scss">
  $marginFromSide: 20px;

  .toast {
    position: fixed;
    color: white;

    padding: 10px 20px;

    background: rgb(32, 32, 32);
    color: #ddd;

    //
    // Positioning
    //

    bottom: $marginFromSide;
    right: $marginFromSide;

    &.top-left {
      top: $marginFromSide;
      left: $marginFromSide;
    }

    &.top-right {
      top: $marginFromSide;
      right: $marginFromSide;
    }

    &.bottom-left {
      bottom: $marginFromSide;
      left: $marginFromSide;
    }

    .close {
      position: absolute;
      top: 0;
      right: 0;

      padding: 10px;

      cursor: pointer;
    }
  }
</style>
