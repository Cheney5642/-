import type { OrderStatus } from "@/lib/types";

export function StatusBanner({ status }: { status: OrderStatus }) {
  const high = status === "HIGH_RISK" || status === "HUMAN_REVIEW";
  const medium = status === "RISK_DETECTED";
  const config = high
    ? { icon: "🔴", title: "高风险，等待人工处理", detail: status === "HUMAN_REVIEW" ? "人工复核任务已创建" : "需要立即创建人工复核", classes: "border-red-200 bg-redSoft text-red-900" }
    : medium
      ? { icon: "🟠", title: "发现待处理风险", detail: "请完成建议动作后继续服务", classes: "border-amber-200 bg-amberSoft text-amber-900" }
      : { icon: "🟢", title: status === "COMPLETED" ? "服务已完成" : "当前服务正常", detail: status === "RISK_HANDLED" ? "风险已完成闭环" : "未发现需要人工介入的异常", classes: "border-emerald-200 bg-mint text-emerald-900" };

  return (
    <section className={`rounded-2xl border p-4 ${config.classes}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-sm">{config.icon}</span>
        <div><h2 className="font-semibold">{config.title}</h2><p className="mt-1 text-sm opacity-70">{config.detail}</p></div>
      </div>
    </section>
  );
}
