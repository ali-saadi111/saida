/** Shared class names so buttons and links look the same everywhere. */
export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 py-3 text-[0.95rem] font-medium text-accent-ink transition-[background-color,transform] duration-200 hover:bg-accent-hover active:translate-y-px disabled:opacity-60",
  secondary:
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-ink/25 px-6 py-3 text-[0.95rem] font-medium text-ink transition-[background-color,border-color,transform] duration-200 hover:border-ink/60 hover:bg-ink/5 active:translate-y-px",
  quiet:
    "inline-flex items-center gap-1.5 font-medium text-accent underline-offset-4 hover:underline",
  chip:
    "inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-ink/40",
};

export const container = "mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-10";
