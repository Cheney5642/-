import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({ children, backHref, eyebrow }: { children: ReactNode; backHref?: string; eyebrow?: string }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-canvas pb-10 sm:my-6 sm:min-h-[calc(100vh-3rem)] sm:overflow-hidden sm:rounded-[28px] sm:border sm:border-slate-200 sm:shadow-card">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/70 bg-canvas/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          {backHref ? (
            <Link href={backHref} aria-label="返回" className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-lg text-slate-700">←</Link>
          ) : (
            <div className="grid size-9 place-items-center rounded-xl bg-brand text-lg text-white">布</div>
          )}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{eyebrow || "履约质量守护"}</p>
            <p className="font-semibold text-ink">小布守护</p>
          </div>
        </div>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">猫咪上门喂养</span>
      </header>
      <div className="px-5 py-5">{children}</div>
    </main>
  );
}
