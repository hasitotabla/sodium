export const PREVIEWABLE_MIME_TYPES: { [key: string]: boolean } = [
  "image",
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/gif",
  "image/webp",

  "video",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
].reduce((prev, curr) => ({ ...prev, [curr]: true }), {});
