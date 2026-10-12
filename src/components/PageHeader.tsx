import { container } from "@/lib/ui";

export function PageHeader({ title, lead, children }: { title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <div className={`${container} pb-8 pt-12 sm:pt-16`}>
      <h1 className="rise text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
      {lead && <p className="rise mt-4 max-w-[60ch] text-lg text-muted" style={{ "--i": 1 } as React.CSSProperties}>{lead}</p>}
      {children}
    </div>
  );
}
