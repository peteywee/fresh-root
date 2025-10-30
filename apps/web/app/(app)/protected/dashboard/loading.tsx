export default function Loading() {
  return (
    <div className="grid gap-4 p-4">
      <div className="h-10 w-48 animate-pulse rounded bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-32 animate-pulse rounded-lg bg-neutral-800" />
        <div className="h-32 animate-pulse rounded-lg bg-neutral-800" />
        <div className="h-32 animate-pulse rounded-lg bg-neutral-800" />
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-neutral-800" />
    </div>
  );
}
