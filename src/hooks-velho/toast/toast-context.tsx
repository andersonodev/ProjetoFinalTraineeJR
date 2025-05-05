import * as React from "react";
import { ToasterToast, State, Toast } from "./types";
import { createReducer } from "./toast-reducer";
import { genId } from "./toast-utils";

// Create a context for the toast state
export const ToastContext = React.createContext<{
  toasts: ToasterToast[];
  toast: (props: Toast) => {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToast) => void;
  };
  dismiss: (toastId?: string) => void;
} | undefined>(undefined);

// Initial state
const initialState: State = { toasts: [] };

// Provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  // Create a ref to store the dispatch function
  const dispatchRef = React.useRef<(action: any) => void>(() => {
    // Removendo a chamada direta que causava o erro
    // Não chamamos state[1] (dispatch) diretamente aqui
  });
  
  // Create the reducer with access to dispatch
  const reducer = React.useMemo(() => {
    return createReducer((action) => dispatchRef.current(action));
  }, []);
  
  const [stateValue, stateDispatch] = React.useReducer(reducer, initialState);
  
  // Update dispatch ref when stateDispatch changes
  React.useEffect(() => {
    dispatchRef.current = stateDispatch;
  }, [stateDispatch]);
  
  const toast = React.useCallback((props: Toast) => {
    const id = genId();
    
    const update = (props: ToasterToast) => 
      stateDispatch({
        type: "UPDATE_TOAST",
        toast: { ...props, id },
      });
      
    const dismiss = () => stateDispatch({ type: "DISMISS_TOAST", toastId: id });
    
    stateDispatch({
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
      id,
      dismiss,
      update,
    };
  }, [stateDispatch]);
  
  const dismiss = React.useCallback((toastId?: string) => {
    stateDispatch({ type: "DISMISS_TOAST", toastId });
  }, [stateDispatch]);
  
  return (
    <ToastContext.Provider value={{ toasts: stateValue.toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

// Custom hook to use the toast context
export const useToast = () => {
  const context = React.useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return context;
};
