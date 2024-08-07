<script lang="ts">
  export let label: string | null = null;
  export let isPassword: boolean = false;

  export let value: string;

  let isPasswordHidden = isPassword;
  const togglePasswordVisibility = () => {
    isPasswordHidden = !isPasswordHidden;
  };
</script>

<div class="container">
  {#if label}
    <p class="label">{label}</p>
  {/if}

  {#if isPasswordHidden}
    <input {...$$props} type="password" data-password="true" on:change bind:value />
  {:else}
    <input {...$$props} type="text" data-password="false" on:change bind:value />
  {/if}
</div>

<style lang="scss">
  .container {
    margin: 8pt 0;

    .label {
      font-size: 0.8rem;
      margin-bottom: 0.2rem;

      color: #666;
    }

    input {
      // width: 100%;
      padding: 0.5rem;

      border: 1px solid #222222;
      border-radius: 8pt;

      font-family: "Inter", sans-serif;

      background: #111;

      &:active,
      &:focus {
        outline: none;
        border-color: #666666;
      }

      &[data-password="true"] > &:after {
        content: "👁️";
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
      }
    }
  }
</style>
