// [P2][UI][CODE] Inbox
// Tags: P2, UI, CODE
"use client";
import React, { useMemo } from "react";

const Inbox = React.memo(() => {
  // Memoized messages for performance
  const messages = useMemo(
    () => [
      {
        id: "m1",
        title: "Schedule Published",
        body: "Your schedule has been published successfully",
        type: "success",
        time: "2 hours ago",
      },
      {
        id: "m2",
        title: "New Message",
        body: "You have a new message from the team",
        type: "info",
        time: "1 day ago",
      },
      {
        id: "m3",
        title: "Receipt Generated",
        body: "Receipt for your recent transaction is ready",
        type: "neutral",
        time: "3 days ago",
      },
    ],
    [],
  );

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success":
        return "border-secondary bg-secondary/5";
      case "info":
        return "border-primary bg-primary/5";
      default:
        return "border-surface-accent bg-surface-accent/50";
    }
  };

  return (
    <div className="card p-4">
      <h3 className="text-primary mb-4 text-lg font-semibold">Inbox</h3>
      <div className="max-h-64 space-y-3 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:shadow-md ${getTypeStyles(m.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-text font-medium">{m.title}</div>
                <div className="text-text-muted mt-1 text-sm">{m.body}</div>
              </div>
              <div className="text-text-muted ml-2 text-xs">{m.time}</div>
            </div>
          </div>
        ))}
      </div>
      {messages.length === 0 && (
        <div className="text-text-muted py-8 text-center">
          <div className="mb-2 text-4xl">📭</div>
          <p>No messages yet</p>
        </div>
      )}
    </div>
  );
});

Inbox.displayName = "Inbox";

export default Inbox;
