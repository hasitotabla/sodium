<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import Fa from "svelte-fa";
  import { faTrash, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
  import moment from "moment";

  import DashboardPage from "$components/_partial/DashboardPage.svelte";
  import { fetch } from "$lib/fetch";
  import { showToast } from "$components/_partial/toast/_Toast";
  import type { SharedFile } from "$shared/types/File";
  import { convertFileSize } from "$lib/file";
  import { nFormatter } from "$lib/number";
  import FilePreview from "$components/_partial/FilePreview.svelte";
  import type { SharedUser } from "$shared/types/User";
  import { userStore } from "src/stores/User";
  import Pagination from "$components/_partial/Pagination.svelte";

  const PAGE_SIZES = [15, 30, 50, 100];
  const DEFAULT_PAGE_SIZE_INDEX = 0;

  let user: SharedUser | null = null;
  userStore.subscribe((value) => (user = value));

  let maxPreviewFileSize = 25600;

  let files: SharedFile[] = [];
  let totalNumOfFiles = 0;

  let page = 0;
  let pageSize = PAGE_SIZES[DEFAULT_PAGE_SIZE_INDEX];
  let search = "";
  let sortBy = "date_desc";

  const downloadFile = (fileId: string) => window.open(`${import.meta.env.SHARED_API_URL}/files/get/${fileId}`, "_blank");
  const openFile = (fileId: string) => navigate(`/${fileId}`);

  const deleteFile = async (fileId: string) => {
    const response = await fetch(`/files/delete/${fileId}`, { method: "DELETE" });

    if (!response.success) {
      console.error("Failed to delete file", response);
      return showToast({ message: "Failed to delete file", type: "error" });
    }

    await fetchFiles();
  };

  let onChangeTimeout: number | null = null;
  const onChange = async (resetPage = true) => {
    if (onChangeTimeout) {
      clearTimeout(onChangeTimeout);
    }

    onChangeTimeout = setTimeout(async () => {
      if (resetPage) page = 0;
      await fetchFiles();
    }, 500);
  };

  const onPageChange = (newPage: number) => {
    page = newPage;
    onChange(false);
  };

  const fetchFiles = async () => {
    if (user === null) {
      return;
    }

    const url = new URL(`/files/user/${user.id}`, import.meta.env.SHARED_API_URL);
    url.searchParams.append("pageSize", pageSize.toString());
    url.searchParams.append("sortBy", sortBy);
    url.searchParams.append("search", search);
    url.searchParams.append("page", page.toString());

    const response = await fetch<{ files: SharedFile[]; totalNumOfFiles: number }>(url.toString());
    if (!response.success) {
      console.error("Failed to fetch files", response);
      return showToast({ message: "Failed to fetch files", type: "error" });
    }

    files = response.data.files;
    totalNumOfFiles = response.data.totalNumOfFiles;
  };

  const fetchMaxPreviewFileSize = async () => {
    const response = await fetch<number>("/settings/get?key=file_max_preview_size");
    if (!response.success) {
      console.error("Failed to fetch max preview file size", response);
      return showToast({ message: "Failed to fetch max preview file size", type: "error" });
    }

    maxPreviewFileSize = response.data;
  };

  onMount(async () => {
    await fetchMaxPreviewFileSize();
    await fetchFiles();
  });
  $: fileList = [...files];
</script>

<DashboardPage>
  <div class="container">
    <div class="filters">
      <div class="input-group">
        <label for="search">Search</label>
        <input type="text" id="search" bind:value={search} on:change={() => onChange()} />
      </div>

      <div class="input-group">
        <label for="pagesize">Page Size</label>
        <select id="pagesize" bind:value={pageSize} on:change={() => onChange()}>
          {#each PAGE_SIZES as size}
            <option value={size} selected={size === pageSize}>{size}</option>
          {/each}
        </select>
      </div>

      <div class="input-group sort-by">
        <label for="sort">Sort by</label>
        <select id="sort" bind:value={sortBy} on:change={() => onChange()}>
          <option value="date_desc">Date (newest first)</option>
          <option value="date_asc">Date (oldest first)</option>
          <option value="views_desc">Views (most first)</option>
          <option value="views_asc">Views (least first)</option>
          <option value="size_desc">Size (largest first)</option>
          <option value="size_asc">Size (smallest first)</option>
        </select>
      </div>

      {#if totalNumOfFiles > pageSize}
        <Pagination
          label="Page"
          bind:currentPage={page}
          totalPages={Math.max(0, Math.ceil(totalNumOfFiles / pageSize))}
          onChange={onPageChange}
        />
      {/if}
    </div>

    <div class="files">
      {#each fileList as file}
        <div class="file">
          <div class="file-info">
            <p class="name">{file.originalFileName}</p>
            <p class="infos">
              {convertFileSize(file.size)} |
              {moment(file.uploadedAt).format("MM/DD/YYYY, h:mm A")} |
              {nFormatter(file.views, 2)} view{file.views > 1 ? "s" : ""}
            </p>
          </div>

          <div class="file-preview">
            {#key file.id}
              <FilePreview
                fileId={file.id}
                metadata={file}
                hideAboveFileSize={maxPreviewFileSize}
                onClick={() => file.mimeType.split("/")?.[0] === "image" && window.open(`/${file.id}`)}
              />
            {/key}
          </div>

          <div class="file-actions">
            <button class="download" on:click={() => downloadFile(file.id)}>Download</button>
            <button class="open info" on:click={() => openFile(file.id)}>
              <Fa icon={faArrowUpRightFromSquare} /> Open new tab
            </button>
            <button class="delete error" on:click={() => deleteFile(file.id)}>
              <Fa icon={faTrash} /> Delete
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
</DashboardPage>

<style lang="scss">
  $itemSize: 350px;
  $itemsPerRow: 3;
  $itemsMargin: 10px;
  $itemsPadding: 6px;
  $itemsBorderWidth: 1px;

  $infoSize: calc($itemSize * 0.15);
  $previewSize: calc($itemSize * 0.65);
  $actionsSize: calc($itemSize * 0.15);

  .container {
    position: relative;

    width: min(95%, 1200px);
    left: 50%;
    transform: translateX(-50%);

    h1 {
      font-size: 24px;
      margin-bottom: 20px;

      text-align: center;
    }

    .filters {
      display: flex;
      flex-wrap: wrap;

      margin-top: 2em;

      @media (max-width: 768px) {
        justify-content: center;
        align-items: center;
      }

      .input-group {
        margin-right: 10px;

        &.sort-by {
          margin-right: auto;

          @media (max-width: 768px) {
            margin-right: 10px;
          }
        }
      }
    }

    .files {
      position: relative;
      width: 100%;

      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;

      .file {
        width: max(calc(100% / #{$itemsPerRow} - $itemsMargin * 2 - $itemsPadding * 2 - $itemsBorderWidth * $itemsPerRow), 300px);
        min-height: $itemSize;

        display: flex;
        flex-direction: column;
        justify-content: space-between;

        margin: $itemsMargin;
        padding: $itemsPadding;

        border: 1px solid #333;
        border-radius: 10px;

        // color: black;
        background-color: #101010;
        // box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

        overflow: hidden;

        // @media (max-width: 768px) {
        //   width: min(100%, 300px);
        // }

        .file-info {
          min-height: $infoSize;

          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          .name {
            white-space: nowrap;
          }

          .infos {
            font-size: 11px;
            color: #666;
          }
        }

        .file-preview {
          height: $previewSize;
          overflow: hidden;
        }

        .file-actions {
          min-height: $actionsSize;

          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;

          button {
            margin: 2px 5px;

            @media (max-width: 1200px) {
              margin: 4px 0;

              &.download,
              &.open {
                width: calc(50% - 4px);
              }

              &.download {
                margin-right: 4px;
              }

              &.open {
                margin-left: 4px;
              }

              &.delete {
                width: 100%;
              }
            }
          }
        }
      }
    }
  }
</style>
