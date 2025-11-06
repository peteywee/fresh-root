// [P2][APP][CODE] Loading
// Tags: P2, APP, CODE
// Streaming-friendly skeleton to avoid jank during route transitions.
export default function Loading() {
  return (
    <div className="grid gap-3">
      <div className="h-8 w-40 animate-pulse rounded bg-neutral-800" />
      <div className="h-24 w-full animate-pulse rounded bg-neutral-800" />
      <div className="h-24 w-full animate-pulse rounded bg-neutral-800" />
    </div>
  );
}
