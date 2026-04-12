export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0e17]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "rgba(20,184,166,0.3)", borderTopColor: "transparent" }}
        />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#768a9e]">
          Loading
        </span>
      </div>
    </div>
  );
}
