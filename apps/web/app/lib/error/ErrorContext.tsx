// [P2][APP][CODE] ErrorContext
// Tags: P2, APP, CODE
"use client";
import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";

type ErrorState = { messages: string[] };

type Action = { type: "PUSH"; message: string } | { type: "CLEAR" } | { type: "POP" };

function reducer(state: ErrorState, action: Action): ErrorState {
  switch (action.type) {
    case "PUSH":
      return { messages: [...state.messages, action.message] };
    case "POP": {
      const next = state.messages.slice();
      next.pop();
      return { messages: next };
    }
    case "CLEAR":
      return { messages: [] };
    default:
      return state;
  }
}

const ErrorCtx = createContext<{
  messages: string[];
  pushError: (m: string) => void;
  popError: () => void;
  clearErrors: () => void;
}>({ messages: [], pushError: () => {}, popError: () => {}, clearErrors: () => {} });

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { messages: [] });

  const api = useMemo(
    () => ({
      messages: state.messages,
      pushError: (m: string) => dispatch({ type: "PUSH", message: m }),
      popError: () => dispatch({ type: "POP" }),
      clearErrors: () => dispatch({ type: "CLEAR" }),
    }),
    [state.messages],
  );

  return (
    <ErrorCtx.Provider value={api}>
      {children}
      {/* Minimal inline surface; swap for toast or shadcn Alert if desired */}
      {state.messages.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm space-y-2 rounded border bg-white p-3 text-sm shadow">
          {state.messages.map((m, i) => (
            <div key={i}>{m}</div>
          ))}
          <button className="rounded border px-2 py-1 text-xs" onClick={api.clearErrors}>
            Dismiss
          </button>
        </div>
      )}
    </ErrorCtx.Provider>
  );
}

export function useErrorBus() {
  return useContext(ErrorCtx);
}
