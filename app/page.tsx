"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ProgressTimeline } from "@/components/progress-timeline";
import { StatusBanner } from "@/components/status-banner";
import { useServiceStore } from "@/store/service-store";

export default function MonitorPage() {
  const { order, steps } = useServiceStore();
  return (
    <AppShell>
      <section className="mb-4 rounded-2xl bg-brand p-5 text-white shadow-card">
        <div className="flex items-start justify-between">
          <div><p className="text-xs text-emerald-100">订单 {order.id}</p><h1 className="mt-2 text-2xl font-semibold">{order.pet.name}</h1><p className="mt-1 text-sm text-emerald-50">{order.pet.breed} · {order.pet.age}岁 · {order.serviceType}</p></div>
          <span className="rounded-xl bg-white/15 px-3 py-2 text-sm">{order.scheduledStart}–{order.scheduledEnd}</span>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-sm"><span className="text-emerald-100">服务者</span><span className="font-medium">{order.providerName}</span></div>
      </section>
      <div className="mb-4"><StatusBanner status={order.status} /></div>
      <ProgressTimeline steps={steps} />
      <div className="mt-4 grid gap-2.5">
        <Link href="/service" className="rounded-xl bg-brand px-4 py-3.5 text-center text-sm font-semibold text-white">进入服务操作</Link>
        <Link href="/risk" className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-center text-sm font-semibold text-ink">查看当前风险</Link>
        <Link href="/report" className="rounded-xl px-4 py-3 text-center text-sm font-medium text-slate-500">查看质检报告</Link>
      </div>
    </AppShell>
  );
}
