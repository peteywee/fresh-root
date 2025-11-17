// [P2][UI][CODE] UploadStub
// Tags: P2, UI, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function UploadStub() {
    return (_jsxs("div", { className: "rounded border p-4 text-sm", children: [_jsx("div", { className: "font-semibold", children: "Upload (Stub)" }), _jsx("p", { className: "mb-2 opacity-80", children: "This only captures a file and logs it \u2014 no storage SDK yet." }), _jsx("input", { type: "file", onChange: (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        console.log("Selected file:", { name: file.name, size: file.size, type: file.type });
                    }
                } })] }));
}
