<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import Fa from "svelte-fa";
  import { faDownload, faTrash, faCopy } from "@fortawesome/free-solid-svg-icons";
  import { fade } from "svelte/transition";
  import moment from "moment";

  import { type SharedFile } from "$shared/types/File";
  import { fetch } from "$lib/fetch";
  import { type SharedUser } from "$shared/types/User";
  import { userStore } from "src/stores/User";
  import { convertFileSize } from "$lib/file";
  import { showToast } from "$components/_partial/toast/_Toast";
  import Popup from "$components/_partial/popup/Popup.svelte";
  import { getInterpFunction } from "$lib/interp";
  import FilePreview from "$components/_partial/FilePreview.svelte";
  import { nFormatter } from "$lib/number";

  export let id: string;

  let user: SharedUser | null = null;
  userStore.subscribe((value) => (user = value));

  let showPasswordPrompt = false;
  let enteredPassword = "";

  let fileData: SharedFile | null = null;
  let hasPermissionToDelete: boolean = true;

  const downloadFile = async () => {
    if (fileData === null) {
      return;
    }

    window.open(`${import.meta.env.SHARED_API_URL}/files/get/${id}`);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(`${import.meta.env.SHARED_API_URL}/files/get/${id}`);
    showToast({ message: "URL copied to clipboard", type: "success" });
  };

  const deleteFile = async () => {
    if (fileData === null) {
      return;
    }

    const response = await fetch(`/files/delete/${id}`, {
      method: "DELETE",
    });

    if (!response?.success) {
      return showToast({ message: "Failed to delete file", type: "error" });
    }

    showToast({ message: "File deleted successfully", type: "success" });
  };

  const fetchMetadata = async () => {
    const response = await fetch<{ metadata: SharedFile; canDelete: boolean }>(`/files/metadata/${id}?password=${enteredPassword}`, {
      method: "GET",
    });
    if (!response.success) {
      if (response.status === 404) navigate("/");
      if (!showPasswordPrompt) showPasswordPrompt = true;

      return;
    }

    if (showPasswordPrompt) showPasswordPrompt = false;

    fileData = response.data.metadata;
    hasPermissionToDelete = response.data.canDelete;
  };

  onMount(fetchMetadata);

  $: shownFileName =
    fileData !== null
      ? fileData.originalFileName.length > 30
        ? `${fileData.originalFileName.slice(0, 30)}...`
        : fileData.originalFileName
      : "";
</script>

{#if fileData !== null && !showPasswordPrompt}
  <div class="container" transition:fade={{ duration: 500, easing: getInterpFunction("outQuart") }}>
    <div class="header">
      <div class="infos">
        <p class="file">
          <span class="name">{fileData.originalFileName}</span>
          <span class="size">({convertFileSize(fileData.size)})</span>
        </p>
        <span class="upload-date">
          Uploaded on {moment(fileData.uploadedAt).format("MM/DD/YYYY, h:mm A")} | {nFormatter(fileData.views, 2)} view{fileData.views > 1
            ? "s"
            : ""}
        </span>
      </div>

      <div class="actions">
        <button class="download" on:click={downloadFile}>
          <Fa icon={faDownload} />
          Download
        </button>

        <button class="info" on:click={copyUrl}>
          <Fa icon={faCopy} />
          Copy URL
        </button>

        {#if hasPermissionToDelete}
          <button class="delete error" on:click={deleteFile}>
            <Fa icon={faTrash} /> Delete
          </button>
        {/if}
      </div>
    </div>

    <div class="preview">
      <FilePreview fileId={id} metadata={fileData} countAsView onClick={downloadFile} />
    </div>
  </div>
{/if}

{#if showPasswordPrompt}
  <Popup style="max-width: 300px;">
    <h2 class="enter-password">Enter the password to view this content:</h2>

    <input type="password" placeholder="Password" bind:value={enteredPassword} />
    <button style="margin-left: 1em;" on:click={fetchMetadata}>Enter</button>
  </Popup>
{/if}

<style lang="scss">
  .container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: min(90%, 1100px);
    // height: min(90%, 800px);
    max-height: min(90%, 800px);

    display: flex;
    flex-flow: column;

    overflow: hidden;

    .header {
      flex: 0 1 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;

      padding: 1em 0;

      .infos {
        display: flex;
        flex-direction: column;

        @media screen and (min-width: 768px) {
          margin-bottom: 1em;
        }

        // gap: 0.5em;

        .upload-date,
        .views {
          font-size: 0.8em;
          color: #666;
        }
      }

      @media (max-width: 768px) {
        .actions {
          width: 100%;
          margin-top: 1em;

          button {
            margin: 4px;
          }
        }
      }
    }

    .preview {
      position: relative;

      // height: 200px;
      flex: 1 1 auto;

      overflow: hidden;
    }
  }

  .enter-password {
    margin-bottom: 1em;

    font-size: 18px;
    font-weight: 400;
  }
</style>
