import type { Pet, RiskAnalysis, ServiceStep } from "@/lib/types";

export interface AnalyzeInput {
  pet: Pet;
  serviceType: string;
  observationText: string;
  completedSteps: ServiceStep[];
}

const hasAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

export function analyzeWithFallback(input: AnalyzeInput): RiskAnalysis {
  const text = input.observationText.trim();
  const highSignals: string[] = [];
  const mediumSignals: string[] = [];

  if (hasAny(text, ["持续呕吐", "一直吐", "连续吐", "吐了几次"])) highSignals.push("persistent_vomiting");
  if (hasAny(text, ["站不稳", "站立不稳", "站立也不太稳", "无法站立"])) highSignals.push("unstable_standing");
  if (hasAny(text, ["受伤", "流血"])) highSignals.push("visible_injury");
  if (text.includes("走失")) highSignals.push("pet_missing");
  if (text.includes("抽搐")) highSignals.push("convulsion");
  if (text.includes("呼吸异常")) highSignals.push("abnormal_breathing");

  if (hasAny(text, ["躲", "躲藏"])) mediumSignals.push("hiding_behavior");
  if (hasAny(text, ["吃得少", "吃得比平时少", "食欲下降", "不太吃"])) mediumSignals.push("reduced_appetite");
  if (hasAny(text, ["精神不太好", "轻微异常"])) mediumSignals.push("low_energy");

  const recoveredNormal = hasAny(text, ["之后已经自己出来", "现在状态正常", "恢复正常"])
    && hasAny(text, ["正常吃饭喝水", "正常吃饭", "正常喝水", "玩耍"]);

  if (highSignals.length > 0) {
    return {
      signals: highSignals,
      risk_level: "high",
      reason: "现场描述包含需要立即人工介入的明显异常信号。",
      recommended_actions: ["stop_automatic_flow", "contact_human_support", "notify_owner"],
      human_required: true,
      source: "fallback",
    };
  }

  if (mediumSignals.length > 0 && !recoveredNormal) {
    return {
      signals: mediumSignals,
      risk_level: "medium",
      reason: "现场描述包含行为或进食变化，需要补充观察并同步主人。",
      recommended_actions: ["observe_pet", "upload_photo", "notify_owner"],
      human_required: false,
      source: "fallback",
    };
  }

  return {
    signals: recoveredNormal ? [] : mediumSignals,
    risk_level: "low",
    reason: recoveredNormal ? "短暂变化后已恢复正常，暂未发现持续异常。" : "现场描述未发现明显风险信号。",
    recommended_actions: [],
    human_required: false,
    source: "fallback",
  };
}
