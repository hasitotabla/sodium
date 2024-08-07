<script lang="ts">
  import DashboardPage from "$components/_partial/DashboardPage.svelte";
  import { showToast } from "$components/_partial/toast/_Toast";
  import { fetch } from "$lib/fetch";
  import { onMount } from "svelte";

  const fields: Array<{
    label: string;
    fullWidth?: boolean;
    values: Array<{ id: string; label: string; type: "checkbox" | "number" | "text"; defaultValue: any; style?: string }>;
  }> = [
    {
      label: "Registration",
      values: [
        { id: "is_registration_open", label: "Registrations open", type: "checkbox", defaultValue: true },
        { id: "invite_only", label: "Invite only", type: "checkbox", defaultValue: false },
      ],
    },
    {
      label: "Users",
      values: [{ id: "user_default_upload_limit", label: "Default upload limit (KiB)", type: "number", defaultValue: 1024 * 1024 * 512 }],
    },
    {
      label: "Files",
      values: [
        { id: "file_ignore_same_checksum", label: "Ignore files with the same checksum", type: "checkbox", defaultValue: false },
        { id: "file_ignore_checksum_for", label: "Ignore checksum for (seconds)", type: "number", defaultValue: 60 * 60 },
        { id: "file_max_preview_size", label: "Max preview file size (KiB)", type: "number", defaultValue: 1024 * 25 },
      ],
    },
    {
      label: "Home page",
      fullWidth: true,
      values: [
        {
          id: "home_page_content",
          label: "Home page content",
          type: "text",
          defaultValue: "Welcome to the home page!",
          style: "width: 50%; height: 150px;",
        },
      ],
    },
  ];

  let loaded = false;
  let fieldsData: {
    [key: string]: {
      original: any;
      edited: any;
    };
  } = {};

  const fetchSettings = async () => {
    const response = await fetch("/settings/all", { method: "GET" });
    if (!response.success) return;

    for (const category of fields) {
      for (const field of category.values) {
        fieldsData[field.id] = {
          original: response.data[field.id] ?? field.defaultValue,
          edited: response.data[field.id] ?? field.defaultValue,
        };
      }
    }

    loaded = true;
  };

  const saveSettings = async () => {
    const modifiedFields = Object.entries(fieldsData).filter(([key, value]) => value.original !== value.edited);

    await fetch("/settings/save", {
      method: "PUT",
      data: Object.fromEntries(modifiedFields.map(([key, value]) => [key, value.edited])),
    });

    showToast({
      message: "Settings saved",
      duration: 3000,
    });
  };

  const resetSettings = () => {
    for (const category of fields) {
      for (const field of category.values) {
        fieldsData[field.id].edited = fieldsData[field.id].original;
      }
    }
  };

  onMount(() => {
    fetchSettings();
  });
</script>

<DashboardPage>
  <div class="container">
    <div class="actions">
      <button class="success" on:click={saveSettings}>Save changes</button>
      <button class="error" on:click={resetSettings}>Revert</button>
    </div>

    {#if loaded}
      <div class="categories">
        {#each fields as field}
          <div class="category" style={field.fullWidth ? `width: 100%;` : ""}>
            <p class="label">{field.label}</p>
            <div class="items">
              {#each field.values as item}
                <div class="item">
                  <p>{item.label}</p>

                  {#if item.type === "checkbox"}
                    <input type="checkbox" bind:checked={fieldsData[item.id].edited} style={item.style} />
                  {:else if item.type === "number"}
                    <input type="number" bind:value={fieldsData[item.id].edited} style={item.style} />
                  {:else if item.type === "text"}
                    <textarea bind:value={fieldsData[item.id].edited} style={item.style}></textarea>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p>Loading...</p>
    {/if}
  </div>
</DashboardPage>

<style lang="scss">
  $categoryMargin: 2em;

  .container {
    width: min(95%, 1100px);
    margin: auto;
    margin-top: 2em;

    .categories {
      display: flex;
      flex-wrap: wrap;
      gap: $categoryMargin;

      box-sizing: content-box;

      .category {
        width: calc(50% - #{$categoryMargin});
        margin: 1em 0;

        @media (max-width: 800px) {
          width: 100%;
        }

        .label {
          font-size: 1.5em;
          margin-bottom: 0.5em;
        }

        .items {
          display: grid;
          // grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1em;

          .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1em;
            border-radius: 5px;
            background-color: var(--color-bg-light);
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);

            p {
              margin: 0;
            }

            input[type="checkbox"] {
              width: 20px;
              height: 20px;
            }
          }
        }
      }
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 1em;
      margin-bottom: 2em;
    }
  }
</style>
