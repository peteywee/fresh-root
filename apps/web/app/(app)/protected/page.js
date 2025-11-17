// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useCreateItem } from "../../lib/useCreateItem";
export default function ProtectedDemoPage() {
    const createItem = useCreateItem();
    return (_jsx(ProtectedRoute, { children: _jsxs("main", { className: "space-y-4 p-6", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Protected Demo" }), _jsxs("form", { className: "flex gap-2", onSubmit: (e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const input = form.elements.namedItem("name");
                        const name = input.value.trim();
                        if (name)
                            createItem.mutate({ name });
                        input.value = "";
                    }, children: [_jsx("input", { name: "name", placeholder: "New item name", className: "rounded border px-3 py-2 text-sm" }), _jsx("button", { type: "submit", className: "rounded border bg-black px-3 py-2 text-sm text-white", disabled: createItem.isPending, children: createItem.isPending ? "Creating…" : "Create" })] }), createItem.isError && (_jsx("div", { className: "text-sm text-red-700", children: createItem.error instanceof Error ? createItem.error.message : "Error" })), createItem.isSuccess && (_jsx("pre", { className: "rounded bg-gray-100 p-3 text-xs", children: JSON.stringify(createItem.data, null, 2) }))] }) }));
}
