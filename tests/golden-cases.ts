import { analyzeWithFallback } from "@/lib/fallback-risk-analyzer";
import { initialSteps, mockOrder } from "@/lib/mock-data";
import { canCompleteOrder, evaluateRules } from "@/lib/rule-engine";
import { statusAfterHumanTaskCreated, statusFromRisk } from "@/lib/risk-engine";
import type { RiskAnalysis, ServiceStep } from "@/lib/types";

export interface GoldenCaseResult { id: string; name: string; passed: boolean; checks: string[]; failures: string[] }

const completeSteps = (except?: string): ServiceStep[] => initialSteps.map((step) => ({
  ...step,
  completed: step.id !== except,
  completedAt: step.id !== except ? "2026-09-30T18:30:00+08:00" : null,
}));

const analyze = (text: string, steps = completeSteps()) => analyzeWithFallback({
  pet: mockOrder.pet,
  serviceType: mockOrder.serviceType,
  observationText: text,
  completedSteps: steps,
});

function result(id: string, name: string, assertions: Array<[boolean, string]>): GoldenCaseResult {
  return {
    id, name,
    passed: assertions.every(([passed]) => passed),
    checks: assertions.filter(([passed]) => passed).map(([, label]) => label),
    failures: assertions.filter(([passed]) => !passed).map(([, label]) => label),
  };
}

export function runGoldenCases(): GoldenCaseResult[] {
  const normal = analyze("豆包今天状态正常，正常吃完食物，也喝了水，没有发现异常。");
  const normalComplete = canCompleteOrder(completeSteps(), normal, "IN_SERVICE");

  const noPhotoSteps = completeSteps("photo");
  const noPhoto = analyze("豆包今天状态正常，正常吃完食物，也喝了水，没有发现异常。", noPhotoSteps);
  const noPhotoRules = evaluateRules(noPhotoSteps, noPhoto);

  const medium = analyze("豆包今天一直躲在床底，吃得比平时少，不过目前没有发现其他异常。");
  const high = analyze("豆包今天连续吐了几次，现在站立也不太稳，状态明显异常。");
  const highCompletion = canCompleteOrder(completeSteps(), high, "HIGH_RISK");
  const safeOutput = JSON.stringify(high);
  const falsePositive = analyze("豆包刚开始躲了一会儿，但之后已经自己出来，正常吃饭喝水，也在玩耍，现在状态正常。");

  return [
    result("01", "正常履约", [
      [normal.risk_level === "low", "风险级别为 low"],
      [normal.human_required === false, "无需人工处理"],
      [normalComplete.allowed, "规则允许完成，最终 PASS"],
    ]),
    result("02", "流程缺失", [
      [noPhotoRules.some((issue) => issue.code === "PHOTO_MISSING"), "规则触发 PHOTO_MISSING"],
      [noPhoto.risk_level === "low", "AI 健康风险仍为 low"],
      [noPhotoRules.some((issue) => issue.code === "PROCESS_MISSING"), "流程缺失由规则层识别"],
    ]),
    result("03", "中风险", [
      [medium.risk_level === "medium", "风险级别为 medium"],
      [["hiding_behavior", "reduced_appetite"].every((signal) => medium.signals.includes(signal)), "识别躲藏与食欲下降"],
      [["observe_pet", "upload_photo", "notify_owner"].every((action) => medium.recommended_actions.includes(action)), "建议动作完整"],
      [medium.human_required === false, "无需强制人工处理"],
    ]),
    result("04", "高风险", [
      [high.risk_level === "high", "风险级别为 high"],
      [["persistent_vomiting", "unstable_standing"].every((signal) => high.signals.includes(signal)), "识别持续呕吐与站立不稳"],
      [high.human_required === true, "必须人工处理"],
      [statusFromRisk(high) === "HIGH_RISK" && statusAfterHumanTaskCreated() === "HUMAN_REVIEW", "Risk Engine 推进至 HUMAN_REVIEW"],
      [highCompletion.issues.some((issue) => issue.code === "HUMAN_REVIEW_REQUIRED") && !highCompletion.allowed, "规则层禁止自动完成"],
      [!["疾病", "诊断", "药物", "剂量", "赔付", "责任"].some((term) => safeOutput.includes(term)), "未输出诊断或越权内容"],
    ]),
    result("05", "防误报", [
      [falsePositive.risk_level === "low" || falsePositive.risk_level === "medium", "风险不高于 medium"],
      [falsePositive.risk_level === "low", "恢复正常时优先 low"],
      [falsePositive.human_required === false, "不要求人工处理"],
    ]),
  ];
}

export const goldenSummary = () => {
  const results = runGoldenCases();
  return { results, passed: results.filter((item) => item.passed).length, total: results.length };
};

export type GoldenRiskOutput = RiskAnalysis;
