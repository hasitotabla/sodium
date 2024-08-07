<script lang="ts">
  import DragAndDrop from "$components/_partial/dragndrop/DragAndDrop.svelte";
  import { showToast } from "$components/_partial/toast/_Toast";
  import { fetch } from "$lib/fetch";

  export let showTempSessionCreate = false;
  export let withSessionToken: string | null = null;
  export let onFileUploaded: (url: string) => void = () => null;

  let selectedFile: File | null = null;
  let enteredPassword = "";
  let enteredDeleteDate: Date;

  let shouldAutoDelete = false;

  type FileUploadStatuses = "pending" | "success" | "error" | "none";

  let fileUploadStatus: FileUploadStatuses = "none";
  let uploadPercentage: string | null = null;
  let uploadUrl: string | null = null;

  const uploadFile = async () => {
    if (!selectedFile) {
      return;
    }

    fileUploadStatus = "pending";
    const deletionTimestamp = shouldAutoDelete ? new Date(enteredDeleteDate).getTime() : null;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("password", enteredPassword);
    formData.append("delete_timestamp", (deletionTimestamp || -1).toString());

    const response = await fetch(`/files/upload${withSessionToken ? `?sessionToken=${withSessionToken}` : ""}`, {
      method: "POST",
      data: formData,
      onUploadProgress: (progress) => {
        uploadPercentage = `${((progress.loaded / (progress.total || 1)) * 100).toFixed(2)} %`;
      },
    });

    if (!response.success) {
      fileUploadStatus = "error";
      return;
    }

    uploadPercentage = "";
    fileUploadStatus = "success";

    onFileUploaded(response.data.url);
  };

  const onFileDrop = (files: FileList) => {
    const file = files[0];
    if (!file) {
      return;
    }

    selectedFile = file;
  };

  const onCreateUploadLink = async () => {
    const response = await fetch("/files/createTempSession", {
      method: "POST",
    });
    if (!response.success) {
      return;
    }

    navigator.clipboard.writeText(response.data.url);
    showToast({
      message: "Link copied to clipboard",
      type: "success",
    });
  };
</script>

<div class="container">
  <div class="self-upload">
    <DragAndDrop {onFileDrop} />

    <div class="controls">
      <p class="selected-file">Selected file: <span class="file-name">{selectedFile?.name || "-"}</span></p>

      <div class="input-group">
        <label for="password">Password (leave empty for none)</label>
        <input type="text" id="password" bind:value={enteredPassword} />
      </div>

      <div class="input-group">
        <label for="auto_delete">Auto deletion</label>
        <input type="checkbox" name="" id="auto_delete" bind:checked={shouldAutoDelete} />
      </div>

      {#if shouldAutoDelete}
        <div class="input-group">
          <label for="delete_date">Delete date</label>
          <input type="datetime-local" id="delete_date" bind:value={enteredDeleteDate} />
        </div>
      {/if}

      <div class="submit" style="display: flex;">
        <button disabled={fileUploadStatus === "pending"} on:click={uploadFile}>
          {fileUploadStatus === "pending" ? `Uploading... ${uploadPercentage || ""}` : "Upload"}
        </button>

        {#if uploadUrl}
          Click to open: {uploadUrl}
        {/if}
      </div>
    </div>
  </div>
  {#if showTempSessionCreate}
    <div class="create-remote">
      <hr />
      <p>
        Or you can create a temporary file upload link and share with others. <br />
        The uploaded file will be visible in your files page.
      </p>
      <button class="transparent" on:click={onCreateUploadLink}>Copy link</button>
    </div>
  {/if}
</div>

<style lang="scss">
  .container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: min(95%, 650px);
    // height: 100%;

    .self-upload {
      display: flex;
      align-items: center;
      justify-content: center;

      margin-top: 2em;

      @media (max-width: 768px) {
        flex-direction: column;
      }

      .controls {
        max-width: 300px;
        margin-left: 2em;

        @media (max-width: 768px) {
          margin-top: 2em;
          margin-left: 0;
        }

        .selected-file {
          margin-bottom: 1em;

          .file-name {
            color: var(--accent);
          }
        }

        .submit {
          display: flex;
          align-items: center;
        }
      }
    }

    .create-remote {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;

      margin-top: 2em;

      hr {
        width: 60px;
        border: 1px solid #333;
      }

      p {
        margin: 1em 0;
        font-size: 14px;
        text-align: center;
        color: #888;
      }
    }
  }
</style>
