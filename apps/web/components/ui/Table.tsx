// [P2][UI][CODE] Table
// Tags: P2, UI, CODE
import * as React from "react";

export function Table({ className = "", ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={`min-w-full text-sm ${className}`} {...props} />;
}

export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-neutral-900/40" {...props} />;
}

export function TRow(props: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className="border-t border-neutral-800" {...props} />;
}

export function TH({ className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`px-3 py-2 text-left ${className}`} {...props} />;
}

export function TD({ className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-3 py-2 ${className}`} {...props} />;
}
