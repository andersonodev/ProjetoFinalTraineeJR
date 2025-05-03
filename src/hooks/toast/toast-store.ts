
import { State, Action, Toast, ToasterToast } from "./types";
import { createReducer } from "./toast-reducer";
import { genId } from "./toast-utils";

// Array to store listeners
export const listeners: Array<(state: State) => void> = [];

// Memory state for standalone toast function
export let memoryState: State = { toasts: [] };

// Forward declaration of dispatch
export let dispatch: (action: Action) => void;

// Create the reducer with the dispatch function
const reducer = createReducer((action) => dispatch(action));

// Now initialize the dispatch function
dispatch = (action: Action) => {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
};

// Standalone toast function
export function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
    
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}
