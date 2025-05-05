
import { Action, TOAST_REMOVE_DELAY } from "./types";

// Utility for generating unique IDs
let count = 0;
export function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Map to manage toast timeouts
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// We'll create a function that takes dispatch as a parameter to avoid circular dependency
export const createAddToRemoveQueue = (dispatch: (action: Action) => void) => {
  return (toastId: string) => {
    if (toastTimeouts.has(toastId)) {
      return;
    }

    const timeout = setTimeout(() => {
      toastTimeouts.delete(toastId);
      dispatch({
        type: "REMOVE_TOAST",
        toastId: toastId,
      });
    }, TOAST_REMOVE_DELAY);

    toastTimeouts.set(toastId, timeout);
  };
};
