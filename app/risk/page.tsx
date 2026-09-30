"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useServiceStore } from "@/store/service-store";
import type { RiskLevel } from "@/lib/types";

const signalLabels: Record<string, string> = {
  hiding_behavior: "躲藏行为",
  reduced_appetite: "食欲下降",
  low_energy: "精神状态下降",
  persistent_vomiting: "持续呕吐",
  unstable_standing: "站立不稳",
  visible_injury: "明显受伤",
  pet_missing: "宠物走失",
  convulsion: "抽搐",
  abnormal_breathing: "呼吸异常",
};

export default function RiskPage() {
  const { analysis, order, mediumActions, completeMediumAction, createHumanReview, humanTaskId, addBadCase, badCaseAdded } = useServiceStore();
  const [showFeedback, setShowFeedback] = useState(false);
  const [failureType, setFailureType] = useState("风险等级错误");
  const [correctedLevel, setCorrectedLevel] = useState<RiskLevel>(analysis?.risk_level || "low");

  if (!analysis) {
    return <AppShell backHref="/" eyebrow="风险处理"><div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card"><p className="font-semibold">暂无风险分析结果</p><p className="mt-2 text-sm text-slate-500">请先填写现场备注并提交检查。</p><Link href="/service" className="mt-5 inline-block rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white">进入服务操作</Link></div></AppShell>;
  }

  const high = analysis.risk_level === "high";
  const medium = analysis.risk_level === "medium";
  const handled = order.status === "RISK_HANDLED";

  return (
    <AppShell backHref="/service" eyebrow="风险处理">
      <section className={`rounded-2xl border p-5 shadow-card ${high ? "border-red-200 bg-redSoft" : medium ? "border-amber-200 bg-amberSoft" : "border-emerald-200 bg-mint"}`}>
        <p className="text-xl">{high ? "🔴" : medium ? "🟠" : "🟢"}</p>
        <h1 className={`mt-3 text-lg font-semibold ${high ? "text-red-950" : medium ? "text-amber-950" : "text-emerald-950"}`}>{high ? "高风险，需要人工介入" : medium ? "发现宠物状态异常" : "暂未发现明显风险"}</h1>
        <p className="mt-2 text-sm leading-6 opacity-70">{high ? "当前情况涉及明显健康异常，AI不继续给出医疗判断，请立即联系人工客服并同步宠物主人。" : medium ? analysis.reason : "可以继续当前服务"}</p>
        <span className="mt-4 inline-block rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-slate-500">分析来源：{analysis.source === "llm" ? "真实 LLM" : "本地 Fallback"}</span>
      </section>

      {analysis.signals.length > 0 && (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card"><h2 className="text-sm font-semibold">识别信号</h2><div className="mt-3 flex flex-wrap gap-2">{analysis.signals.map((signal) => <span key={signal} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700">{signalLabels[signal] || signal}</span>)}</div></section>
      )}

      {medium && (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <h2 className="text-sm font-semibold">建议动作</h2><p className="mt-1 text-xs text-slate-400">三项全部完成后风险进入已处理状态。</p>
          <div className="mt-4 grid gap-2.5">
            <ActionButton done={mediumActions.observe_pet} onClick={() => completeMediumAction("observe_pet")} label="已完成补充观察" />
            <ActionButton done={mediumActions.upload_photo} onClick={() => completeMediumAction("upload_photo")} label="已上传当前状态照片" />
            <ActionButton done={mediumActions.notify_owner} onClick={() => completeMediumAction("notify_owner")} label="同步给主人" />
          </div>
          {handled && <p className="mt-3 rounded-lg bg-mint p-3 text-sm font-medium text-emerald-800">✓ 建议动作已完成，风险已闭环</p>}
        </section>
      )}

      {(high || order.status === "HUMAN_REVIEW") && (
        <section className="mt-4 rounded-2xl border border-red-200 bg-white p-4 shadow-card">
          {humanTaskId ? <div><p className="font-semibold">人工复核任务 #{humanTaskId}</p><p className="mt-1 text-sm text-red-700">状态：等待处理</p></div> : <button type="button" onClick={createHumanReview} className="w-full rounded-xl bg-red-700 px-4 py-3.5 text-sm font-semibold text-white">创建人工复核任务</button>}
        </section>
      )}

      <div className="mt-4 grid gap-2.5">
        {!high && <Link aria-disabled={medium && !handled} href={medium && !handled ? "/risk" : "/service"} className={`rounded-xl px-4 py-3.5 text-center text-sm font-semibold ${medium && !handled ? "cursor-not-allowed bg-slate-200 text-slate-400" : "bg-brand text-white"}`}>继续服务</Link>}
        {medium && <button type="button" onClick={createHumanReview} className="rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700">请求人工协助</button>}
      </div>

      <section className="mt-6 border-t border-slate-200 pt-5">
        <div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-600">AI判断有误？</p><button type="button" onClick={() => setShowFeedback((current) => !current)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">标记问题</button></div>
        {showFeedback && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
            <label className="text-xs font-medium text-slate-500">问题类型</label>
            <select value={failureType} onChange={(event) => setFailureType(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm"><option>风险等级错误</option><option>漏掉异常</option><option>误报异常</option><option>建议动作不合理</option><option>其他</option></select>
            <label className="mt-3 block text-xs font-medium text-slate-500">修正风险级别</label>
            <select value={correctedLevel} onChange={(event) => setCorrectedLevel(event.target.value as RiskLevel)} className="mt-1.5 w-full rounded-lg border border-slate-200 p-2.5 text-sm"><option value="low">低风险</option><option value="medium">中风险</option><option value="high">高风险</option></select>
            <button type="button" onClick={() => addBadCase(failureType, correctedLevel)} className="mt-3 w-full rounded-lg bg-ink px-3 py-2.5 text-sm font-semibold text-white">提交问题</button>
            {badCaseAdded && <p className="mt-3 rounded-lg bg-mint p-2.5 text-center text-sm font-medium text-emerald-800">已加入 Bad Case Pool</p>}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function ActionButton({ done, onClick, label }: { done: boolean; onClick: () => void; label: string }) {
  return <button type="button" disabled={done} onClick={onClick} className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-medium ${done ? "border-emerald-100 bg-mint text-emerald-800" : "border-slate-200"}`}><span className={`grid size-6 place-items-center rounded-full ${done ? "bg-brand text-white" : "border border-slate-300 text-transparent"}`}>✓</span>{label}</button>;
}
