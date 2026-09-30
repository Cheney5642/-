import type { OrderStatus, RiskAnalysis } from "@/lib/types";

export function statusFromRisk(risk: RiskAnalysis): OrderStatus {
  if (risk.human_required || risk.risk_level === "high") return "HIGH_RISK";
  if (risk.risk_level === "medium") return "RISK_DETECTED";
  return "IN_SERVICE";
}

export function statusAfterMediumActions(actionsComplete: boolean): OrderStatus {
  return actionsComplete ? "RISK_HANDLED" : "RISK_DETECTED";
}

export function statusAfterHumanTaskCreated(): OrderStatus {
  return "HUMAN_REVIEW";
}
