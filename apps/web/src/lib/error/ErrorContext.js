// [P2][APP][CODE] ErrorContext
// Tags: P2, APP, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useMemo, useReducer } from "react";
function reducer(state, action) {
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
const ErrorCtx = createContext({ messages: [], pushError: () => { }, popError: () => { }, clearErrors: () => { } });
export function ErrorProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, { messages: [] });
    const api = useMemo(() => ({
        messages: state.messages,
        pushError: (m) => dispatch({ type: "PUSH", message: m }),
        popError: () => dispatch({ type: "POP" }),
        clearErrors: () => dispatch({ type: "CLEAR" }),
    }), [state.messages]);
    return (_jsxs(ErrorCtx.Provider, { value: api, children: [children, state.messages.length > 0 && (_jsxs("div", { className: "fixed bottom-4 right-4 z-50 max-w-sm space-y-2 rounded border bg-white p-3 text-sm shadow", children: [state.messages.map((m, i) => (_jsx("div", { children: m }, i))), _jsx("button", { className: "rounded border px-2 py-1 text-xs", onClick: api.clearErrors, children: "Dismiss" })] }))] }));
}
export function useErrorBus() {
    return useContext(ErrorCtx);
}
