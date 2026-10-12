/** Simple programme mark: three sea threads. Placeholder until the official logo is approved. */
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M4 11c4-3 8-3 12 0s8 3 12 0" />
      <path d="M4 17c4-3 8-3 12 0s8 3 12 0" opacity="0.7" />
      <path d="M4 23c4-3 8-3 12 0s8 3 12 0" opacity="0.45" />
    </svg>
  );
}
