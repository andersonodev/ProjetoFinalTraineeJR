
import { Action, State, TOAST_LIMIT } from "./types";
import { createAddToRemoveQueue } from "./toast-utils";

export const createReducer = (dispatch: (action: Action) => void) => {
  const addToRemoveQueue = createAddToRemoveQueue(dispatch);
  
  return (state: State, action: Action): State => {
    switch (action.type) {
      case "ADD_TOAST":
        return {
          ...state,
          toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
        };

      case "UPDATE_TOAST":
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === action.toast.id ? { ...t, ...action.toast } : t
          ),
        };

      case "DISMISS_TOAST": {
        const { toastId } = action;

        if (toastId) {
          addToRemoveQueue(toastId);
        } else {
          state.toasts.forEach((toast) => {
            addToRemoveQueue(toast.id);
          });
        }

        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId || toastId === undefined
              ? {
                  ...t,
                  open: false,
                }
              : t
          ),
        };
      }
      case "REMOVE_TOAST":
        if (action.toastId === undefined) {
          return {
            ...state,
            toasts: [],
          };
        }
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== action.toastId),
        };
    }
  };
};
