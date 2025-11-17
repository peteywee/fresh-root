// [P2][APP][CODE] Page page component
// Tags: P2, APP, CODE
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from "react";
import { Button, Card, Input, Textarea, Loading, Spinner, Alert } from "../../components/ui";
/**
 * Demo page showcasing all UI components
 */
export default function DemoPage() {
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setShowAlert(true);
        }, 2000);
    };
    const handleNameChange = useCallback((e) => {
        setFormData((prev) => ({ ...prev, name: e.target.value }));
    }, []);
    const handleEmailChange = useCallback((e) => {
        setFormData((prev) => ({ ...prev, email: e.target.value }));
    }, []);
    const handleMessageChange = useCallback((e) => {
        setFormData((prev) => ({ ...prev, message: e.target.value }));
    }, []);
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-8", children: _jsxs("div", { className: "mx-auto max-w-6xl space-y-8", children: [_jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "mb-2 text-4xl font-bold text-gray-900", children: "Component Demo" }), _jsx("p", { className: "text-gray-600", children: "Explore the reusable UI components available in Fresh Schedules" })] }), showAlert && (_jsx(Alert, { type: "success", title: "Success!", message: "Form submitted successfully!", onClose: () => setShowAlert(false) })), _jsx(Card, { title: "Buttons", description: "Various button styles and sizes", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx(Button, { variant: "primary", size: "sm", children: "Primary Small" }), _jsx(Button, { variant: "primary", size: "md", children: "Primary Medium" }), _jsx(Button, { variant: "primary", size: "lg", children: "Primary Large" })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx(Button, { variant: "secondary", children: "Secondary" }), _jsx(Button, { variant: "danger", children: "Danger" }), _jsx(Button, { variant: "ghost", children: "Ghost" })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx(Button, { loading: true, children: "Loading" }), _jsx(Button, { disabled: true, children: "Disabled" })] })] }) }), _jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [_jsx(Card, { title: "Default Card", variant: "default", children: _jsx("p", { className: "text-gray-600", children: "This is a default card with a border." }) }), _jsx(Card, { title: "Bordered Card", variant: "bordered", children: _jsx("p", { className: "text-gray-600", children: "This card has a thicker border." }) }), _jsx(Card, { title: "Elevated Card", variant: "elevated", children: _jsx("p", { className: "text-gray-600", children: "This card has a shadow for elevation." }) })] }), _jsx(Card, { title: "Form Example", description: "Example form using Input and Textarea components", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Name", placeholder: "Enter your name", value: formData.name, onChange: handleNameChange, fullWidth: true, helperText: "This field is required" }), _jsx(Input, { label: "Email", type: "email", placeholder: "you@example.com", value: formData.email, onChange: handleEmailChange, fullWidth: true }), _jsx(Textarea, { label: "Message", placeholder: "Enter your message", rows: 4, value: formData.message, onChange: handleMessageChange, fullWidth: true }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { type: "submit", variant: "primary", loading: loading, children: "Submit" }), _jsx(Button, { type: "button", variant: "secondary", children: "Cancel" })] })] }) }), _jsx(Card, { title: "Loading States", description: "Spinners and loading indicators", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "mb-3 text-sm font-medium text-gray-700", children: "Spinner Sizes" }), _jsxs("div", { className: "flex items-center gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx(Spinner, { size: "sm" }), _jsx("p", { className: "mt-2 text-xs text-gray-500", children: "Small" })] }), _jsxs("div", { className: "text-center", children: [_jsx(Spinner, { size: "md" }), _jsx("p", { className: "mt-2 text-xs text-gray-500", children: "Medium" })] }), _jsxs("div", { className: "text-center", children: [_jsx(Spinner, { size: "lg" }), _jsx("p", { className: "mt-2 text-xs text-gray-500", children: "Large" })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "mb-3 text-sm font-medium text-gray-700", children: "Loading Component" }), _jsx("div", { className: "rounded-lg border bg-white p-8", children: _jsx(Loading, { text: "Loading data..." }) })] })] }) }), _jsx(Card, { title: "Alerts", description: "Different alert types for various scenarios", children: _jsxs("div", { className: "space-y-3", children: [_jsx(Alert, { type: "success", title: "Success", message: "Your changes have been saved successfully." }), _jsx(Alert, { type: "error", title: "Error", message: "There was an error processing your request." }), _jsx(Alert, { type: "warning", title: "Warning", message: "Your session will expire in 5 minutes." }), _jsx(Alert, { type: "info", message: "New features have been added to the platform." })] }) }), _jsx(Card, { title: "Card with Footer", description: "This card demonstrates the footer prop", footer: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "Last updated: Just now" }), _jsx(Button, { size: "sm", children: "View Details" })] }), children: _jsx("p", { className: "text-gray-700", children: "Cards can have optional footers for actions or additional information. This is useful for displaying metadata or action buttons." }) }), _jsx(Card, { children: _jsxs("div", { className: "py-4 text-center", children: [_jsx("h3", { className: "mb-2 text-lg font-semibold text-gray-900", children: "Component Documentation" }), _jsx("p", { className: "mb-4 text-gray-600", children: "Learn more about these components and how to use them in your application." }), _jsx(Button, { variant: "primary", children: "View Documentation" })] }) })] }) }));
}
