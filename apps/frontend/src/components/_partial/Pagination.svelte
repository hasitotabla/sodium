<script lang="ts">
  import { range } from "$lib/iter";

  export let label: string = "";
  export let currentPage: number;
  export let totalPages: number;
  export let visiblePages: number = 5;
  export let onChange: (newPage: number) => void = () => {};

  const onSelectPage = (newPage: number) => {
    if (newPage < 0 || newPage > totalPages) {
      return;
    }

    currentPage = newPage;
    onChange(newPage);
  };

  $: pageRangeTo = Math.min(Math.max(0, totalPages - 1), currentPage + Math.floor(visiblePages / 2));
  $: pageRangeFrom = Math.max(0, currentPage - Math.floor(visiblePages / 2));
</script>

<div class="input-group">
  {#if label !== ""}
    <label for="delete_date">{label}</label>
  {/if}

  <div class="pages">
    {#each range(pageRangeFrom, pageRangeTo) as page}
      <button class="dark" disabled={page === currentPage} on:click={() => onSelectPage(page)}>{page + 1}</button>
    {/each}
  </div>
</div>

<style lang="scss">
  .input-group {
    .pages {
      button:not(:last-child) {
        margin-right: 6px;
      }
    }
  }
</style>
