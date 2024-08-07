<script lang="ts">
  import type { ChangeEventHandler } from "svelte/elements";

  export let onFileDrop: (file: FileList) => void;

  let dropZone;
  let isDraggingOver = false;

  const onDrop = (e: any) => {
    e.preventDefault();

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    onFileDrop(files);
    isDraggingOver = false;
  };

  const onDragOver = (e: DragEvent) => {
    isDraggingOver = true;
  };

  const onFileSelect: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e?.target) return;

    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    onFileDrop(target.files);
    isDraggingOver = false;
  };
</script>

<div
  class={`dropzone ${isDraggingOver ? "dragging" : ""}`}
  role="presentation"
  bind:this={dropZone}
  on:drop={onDrop}
  on:dragover={onDragOver}
  on:dragleave={() => (isDraggingOver = false)}
>
  <p>Drop a file here, or click the box to select one.</p>
  <input type="file" on:change={onFileSelect} />
</div>

<style lang="scss">
  .dropzone {
    position: relative;
    width: 300px;
    height: 200px;

    border: 1px solid #333;
    border-radius: 12px;

    background: transparent;
    transition: background 150ms ease-out;

    overflow: hidden;

    &.dragging {
      background: var(--accent);
    }

    p {
      position: absolute;
      width: 75%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      font-size: 14px;

      text-align: center;
    }

    input[type="file"] {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0;
    }
  }
</style>
