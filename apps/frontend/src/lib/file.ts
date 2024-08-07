import { fetch } from "./fetch";

export const convertFileSize = (kbSize: number) => {
  for (const unit of ["KiB", "MiB", "GiB", "TiB"]) {
    if (kbSize < 1024) return `${kbSize.toFixed(2)} ${unit}`;
    kbSize /= 1024;
  }

  return `${kbSize.toFixed(2)} PiB`;
};
