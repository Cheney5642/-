"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { goldenSummary } from "@/tests/golden-cases";
import { useServiceStore } from "@/store/service-store";

export default function ReportPage() {
  const { order, steps, analysis, humanTaskId } = useServiceStore();
  const completed = steps.filter((step) => step.completed).length;
  const missing = steps.filter((step) => step.required && !step.completed).map((step) => step.name);
  const needsReview = order.status === "HIGH_RISK" || order.status === "HUMAN_REVIEW" || analysis?.human_required === true;
  const passed = order.status === "COMPLETED" && !needsReview && missing.length === 0;
  const golden = goldenSummary();
  const riskLabel = !analysis ? "尚未检查" : analysis.risk_level === "high" ? "高风险" : analysis.risk_level === "medium" ? "中风险" : "未发现明显风险";

  return (
    <AppShell backHref="/" eyebrow="服务结束 · 质检报告">
      <section className={`rounded-2xl border p-5 text-center shadow-card ${needsReview ? "border-red-200 bg-redSoft" : passed ? "border-emerald-200 bg-mint" : "border-slate-200 bg-white"}`}>
        <div className="text-2xl">{needsReview ? "⚠️" : passed ? "✅" : "⏳"}</div>
        <h1 className="mt-3 text-lg font-semibold">{needsReview ? "本次服务需要人工复核" : passed ? "本次服务可正常完成" : "本次服务尚未完成"}</h1>
        <p className="mt-1 text-sm text-slate-500">订单 {order.id}</p>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <h2 className="text-sm font-semibold">服务信息</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
          <Info label="宠物" value={`${order.pet.name} · ${order.pet.breed}`} /><Info label="服务" value={order.serviceType} />
          <Info label="服务者" value={order.providerName} /><Info label="服务时间" value={`${order.scheduledStart}–${order.scheduledEnd}`} />
        </dl>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <h2 className="text-sm font-semibold">质检结论</h2>
        <dl className="mt-4 space-y-4 text-sm">
          <ReportRow label="流程完整度" value={`${completed} / ${steps.length}（${Math.round(completed / steps.length * 100)}%）`} />
          <ReportRow label="缺失步骤" value={missing.length ? missing.join("、") : "无"} warning={missing.length > 0} />
          <ReportRow label="宠物状态" value={riskLabel} warning={needsReview} />
          <ReportRow label="风险记录" value={analysis?.signals.length ? analysis.signals.join("、") : "无"} />
          <ReportRow label="处理结果" value={humanTaskId ? `人工复核任务 #${humanTaskId} 等待处理` : order.status === "RISK_HANDLED" ? "风险已闭环" : needsReview ? "待人工处理" : "无需额外处理"} />
          <ReportRow label="最终状态" value={passed ? "PASS" : "NEED_REVIEW"} warning={!passed} />
        </dl>
      </section>

      <section className="mt-4 rounded-2xl bg-ink p-4 text-white shadow-card">
        <div className="flex items-center justify-between"><div><p className="text-xs text-slate-400">自动化验收</p><h2 className="mt-1 font-semibold">Golden Test Result</h2></div><p className="text-xl font-semibold text-emerald-300">{golden.passed} / {golden.total} PASS</p></div>
        {golden.passed !== golden.total && <p className="mt-3 text-xs text-red-300">失败：{golden.results.filter((item) => !item.passed).map((item) => `Case ${item.id}`).join("、")}</p>}
      </section>

      <Link href="/service" className="mt-4 block rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-center text-sm font-semibold text-ink">返回服务操作</Link>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-slate-400">{label}</dt><dd className="mt-1 font-medium text-ink">{value}</dd></div>; }
function ReportRow({ label, value, warning = false }: { label: string; value: string; warning?: boolean }) { return <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0"><dt className="shrink-0 text-slate-500">{label}</dt><dd className={`text-right font-medium ${warning ? "text-red-700" : "text-ink"}`}>{value}</dd></div>; }
