"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RuleAlerts } from "@/components/rule-alerts";
import { quickNotes } from "@/lib/mock-data";
import { useServiceStore } from "@/store/service-store";

export default function ServicePage() {
  const router = useRouter();
  const { steps, completeStep, observationText, setObservationText, submitAnalysis, tryCompleteOrder, ruleIssues, analyzing, order } = useServiceStore();

  const finish = () => { if (tryCompleteOrder()) router.push("/report"); };
  const analyze = async () => { if (await submitAnalysis()) router.push("/risk"); };

  return (
    <AppShell backHref="/" eyebrow="服务者现场操作">
      <div className="mb-4"><RuleAlerts issues={ruleIssues} /></div>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="mb-4 flex items-center justify-between"><h1 className="font-semibold">服务步骤</h1><span className="text-xs text-slate-400">点击完成</span></div>
        <div className="space-y-2.5">
          {steps.map((step, index) => (
            <button key={step.id} type="button" disabled={step.completed || order.status === "HUMAN_REVIEW"} onClick={() => completeStep(step.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${step.completed ? "border-emerald-100 bg-mint" : "border-slate-200 bg-white active:scale-[.99]"} disabled:cursor-default`}>
              <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${step.completed ? "bg-brand text-white" : "bg-slate-100 text-slate-500"}`}>{step.completed ? "✓" : index + 1}</span>
              <span className="flex-1 text-sm font-medium">{step.name}</span>
              <span className={`text-xs ${step.completed ? "text-emerald-700" : "text-slate-400"}`}>{step.id === "photo" ? (step.completed ? "已上传" : "未上传") : (step.completed ? "已完成" : "点此完成")}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <label htmlFor="observation" className="font-semibold">现场备注</label>
        <p className="mt-1 text-xs text-slate-400">AI仅理解异常信号，订单状态由风险与规则层决定。</p>
        <textarea id="observation" value={observationText} onChange={(event) => setObservationText(event.target.value)} placeholder="描述豆包当前的进食、饮水、活动和精神状态…" className="mt-3 min-h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 placeholder:text-slate-400" />
        <div className="mt-3 flex gap-2">
          {(["normal", "medium", "high"] as const).map((type) => (
            <button key={type} type="button" onClick={() => setObservationText(quickNotes[type])} className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium ${type === "normal" ? "border-emerald-200 text-emerald-700" : type === "medium" ? "border-amber-200 text-amber-700" : "border-red-200 text-red-700"}`}>{type === "normal" ? "A 正常" : type === "medium" ? "B 中风险" : "C 高风险"}</button>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-2.5">
        <button type="button" disabled={analyzing || order.status === "HUMAN_REVIEW"} onClick={analyze} className="rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-50">{analyzing ? "正在检查…" : "提交并检查风险"}</button>
        <button type="button" onClick={finish} className="rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-ink">尝试完成服务</button>
      </div>
    </AppShell>
  );
}
