import { writable } from "svelte/store";

export type Toast = {
  message: string;
  type: "success" | "error" | "info";
  duration: number;
};

const DEFAULT_TOAST_CONFIG: Toast = {
  message: "",
  type: "info",
  duration: 5000,
};

let toastId = 0;
export const _toastStore = writable<{ [key: number]: Toast }>([]);

export function showToast(toast: Partial<Toast>) {
  const usedToast = { ...DEFAULT_TOAST_CONFIG, ...toast } as Toast;

  let useToastId = toastId;
  toastId = (toastId + 1) % Number.MAX_SAFE_INTEGER;

  _toastStore.update((toasts) => {
    toasts[useToastId] = usedToast;
    return toasts;
  });

  let closeTimeout: number;

  const close = () => {
    _toastStore.update((toasts) => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }

      delete toasts[useToastId];
      return toasts;
    });
  };

  closeTimeout = setTimeout(close, usedToast.duration);

  return {
    close,
  };
}
