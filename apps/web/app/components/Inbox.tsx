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
      <h3 className="mb-4 text-lg font-semibold text-primary">Inbox</h3>
      <div className="max-h-64 space-y-3 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:shadow-md ${getTypeStyles(m.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-text">{m.title}</div>
                <div className="mt-1 text-sm text-text-muted">{m.body}</div>
              </div>
              <div className="ml-2 text-xs text-text-muted">{m.time}</div>
            </div>
          </div>
        ))}
      </div>
      {messages.length === 0 && (
        <div className="py-8 text-center text-text-muted">
          <div className="mb-2 text-4xl">📭</div>
          <p>No messages yet</p>
        </div>
      )}
    </div>
  );
});

Inbox.displayName = "Inbox";

export default Inbox;
