<script lang="ts">
  import { fetch } from "$lib/fetch";
  import { onMount } from "svelte";
  import { showToast } from "./toast/_Toast";
  import type { SharedFile } from "$shared/types/File";
  import { PREVIEWABLE_MIME_TYPES } from "$shared/consts";

  export let fileId: string;
  export let metadata: SharedFile | null = null;
  export let countAsView = false;
  export let hideAboveFileSize = -1;
  export let onClick: () => void = () => null;

  let container: HTMLDivElement | null = null;
  let mimeType: string | null = null;

  const createNonPreviewableElement = (text: string = "Preview not available") => {
    const element = document.createElement("p");
    element.textContent = text;
    element.classList.add("preview-not-available");

    container?.appendChild(element);
  };

  let fetchPreview = async () => {
    if (!container) {
      return;
    }

    for (const child of container.children) container.removeChild(child);

    if (!metadata?.mimeType) {
      createNonPreviewableElement();
      return;
    }

    const [mediaType] = metadata.mimeType.split("/");

    if (!PREVIEWABLE_MIME_TYPES[mediaType]) {
      createNonPreviewableElement();
      return;
    }

    if (metadata?.size && metadata.size > hideAboveFileSize && hideAboveFileSize !== -1) {
      createNonPreviewableElement("File is too large to preview");
      return;
    }

    const response = await fetch(`/files/get/${fileId}?isView=${countAsView ? "true" : "false"}`, {
      method: "GET",
      responseType: "blob",
    });

    if (!response.success) {
      return showToast({ message: "Failed to fetch preview", type: "error" });
    }

    switch (mediaType) {
      case "image": {
        const element = document.createElement("img");
        element.addEventListener("click", onClick);
        element.onload = (e) => window.URL.revokeObjectURL(element.src);
        element.src = window.URL.createObjectURL(response.data);
        element.classList.add("preview-content");

        container?.appendChild(element);

        break;
      }

      case "video": {
        const element = document.createElement("video");
        element.controls = true;
        element.src = window.URL.createObjectURL(response.data);
        element.classList.add("preview-content");

        container?.appendChild(element);

        break;
      }

      default: {
        createNonPreviewableElement();
        break;
      }
    }
  };

  const fetchMetadata = async () => {
    const response = await fetch<SharedFile>(`/files/metadata/${fileId}`, {
      method: "GET",
    });
    if (!response.success) {
      return;
    }

    mimeType = response.data.mimeType;
  };

  const load = async () => {
    if (!metadata) {
      await fetchMetadata();
    }

    await fetchPreview();
  };

  onMount(load);
</script>

<div class="container" bind:this={container}></div>

<style lang="scss">
  .container {
    position: relative;

    max-width: 100%;
    max-height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    aspect-ratio: 16/9;

    // overflow: hidden;
    // object-fit: cover;

    :global(.preview-content) {
      max-width: 100%;
      max-height: 100%;

      cursor: pointer;
    }

    :global(.preview-not-available) {
      text-align: center;
    }
  }
</style>
