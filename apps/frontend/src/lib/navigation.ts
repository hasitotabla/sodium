export type NavigationChangeListener = () => void;

let listenerId = 0;
const listeners: Map<number, NavigationChangeListener> = new Map();

let previousPath = window.location.pathname;
let checkInterval: number | null = null;

const checkForPathChange = () => {
  if (previousPath !== window.location.pathname) {
    previousPath = window.location.pathname;
    listeners.forEach((listener) => listener());
  }
};

const getEmptyListenerId = () => {
  let newListenerId = (listenerId % 65565) + 1;

  for (let i = newListenerId; i < 65565; i++) {
    if (!listeners.has(i)) {
      newListenerId = i;
      break;
    }
  }

  return newListenerId;
};

export const addNavigationChangeListener = (
  listener: NavigationChangeListener
): {
  id: number;
  remove: () => void;
} => {
  if (listeners.size === 0 && !checkInterval) {
    checkInterval = setInterval(checkForPathChange, 50);
  }

  let newListenerId = getEmptyListenerId();
  listeners.set(newListenerId, listener);

  return {
    id: newListenerId,
    remove: () => {
      listeners.delete(newListenerId);

      if (listeners.size === 0 && checkInterval !== null) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
    },
  };
};
