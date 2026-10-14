/** Fallback shown while a lazily loaded page chunk downloads. */
export function PageLoader() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[70vh] items-center justify-center">
      <div className="h-[3px] w-40 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/3 animate-[loader_1s_ease-in-out_infinite] rounded-full bg-accent" />
      </div>
      <span className="sr-only">Loading page…</span>
      <style>{'@keyframes loader{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}'}</style>
    </div>
  );
}
