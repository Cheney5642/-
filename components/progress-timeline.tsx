import type { ServiceStep } from "@/lib/types";

export function ProgressTimeline({ steps, compact = false }: { steps: ServiceStep[]; compact?: boolean }) {
  const completed = steps.filter((step) => step.completed).length;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="mb-4 flex items-end justify-between">
        <div><p className="text-xs font-medium text-slate-400">服务进度</p><h2 className="mt-1 font-semibold text-ink">履约 Timeline</h2></div>
        <div className="text-right"><span className="text-xl font-semibold text-brand">{completed}</span><span className="text-sm text-slate-400"> / {steps.length}</span></div>
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${completed / steps.length * 100}%` }} /></div>
      <ol className="space-y-0">
        {steps.map((step, index) => (
          <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
            {index < steps.length - 1 && <span className={`absolute left-[11px] top-6 h-full w-px ${step.completed ? "bg-emerald-300" : "bg-slate-200"}`} />}
            <span className={`relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${step.completed ? "bg-brand text-white" : "border border-slate-300 bg-white text-slate-400"}`}>{step.completed ? "✓" : index + 1}</span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <p className={`${compact ? "text-sm" : "text-[15px]"} font-medium ${step.completed ? "text-ink" : "text-slate-500"}`}>{step.name}</p>
              <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${step.completed ? "bg-mint text-emerald-800" : index === completed ? "bg-amberSoft text-amber-700" : "bg-slate-100 text-slate-500"}`}>{step.completed ? "已完成" : index === completed ? "待补充" : "未开始"}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
