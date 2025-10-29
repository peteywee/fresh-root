"use client";
import React from 'react';

export default function Inbox() {
  // Minimal inbox stub for publish notifications and receipts.
  const messages = [{ id: 'm1', title: 'Schedule Published', body: 'A schedule was published' }];
  return (
    <div className="space-y-2">
      {messages.map((m) => (
        <div key={m.id} className="border rounded p-2">
          <div className="font-medium">{m.title}</div>
          <div className="text-sm text-gray-600">{m.body}</div>
        </div>
      ))}
    </div>
  );
}
