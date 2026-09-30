import type { OrderStatus, RiskAnalysis, RuleIssue, ServiceStep } from "@/lib/types";

export function evaluateRules(steps: ServiceStep[], risk?: RiskAnalysis | null): RuleIssue[] {
  const issues: RuleIssue[] = [];

  for (const step of steps) {
    if (step.required && !step.completed) {
      issues.push({ code: "PROCESS_MISSING", message: `${step.name}尚未完成。`, stepId: step.id });
    }
  }

  if (!steps.find((step) => step.id === "photo")?.completed) {
    issues.push({
      code: "PHOTO_MISSING",
      message: "服务过程照片尚未上传，请在离场前补充。",
      stepId: "photo",
    });
  }

  if (risk?.human_required) {
    issues.push({ code: "HUMAN_REVIEW_REQUIRED", message: "高风险必须由人工复核，不能自动完成订单。" });
  }

  return deduplicateIssues(issues);
}

function deduplicateIssues(issues: RuleIssue[]): RuleIssue[] {
  return issues.filter((issue, index) =>
    issues.findIndex((candidate) => candidate.code === issue.code && candidate.stepId === issue.stepId) === index,
  );
}

export function canCompleteOrder(
  steps: ServiceStep[],
  risk: RiskAnalysis | null,
  status: OrderStatus,
): { allowed: boolean; issues: RuleIssue[] } {
  const issues = evaluateRules(steps, risk);
  if (status === "RISK_DETECTED") {
    issues.push({ code: "RISK_UNHANDLED", message: "待处理风险尚未闭环。" });
  }
  if (status === "HIGH_RISK" || status === "HUMAN_REVIEW") {
    if (!issues.some((issue) => issue.code === "HUMAN_REVIEW_REQUIRED")) {
      issues.push({ code: "HUMAN_REVIEW_REQUIRED", message: "高风险必须由人工复核，不能自动完成订单。" });
    }
  }
  return { allowed: issues.length === 0, issues };
}
