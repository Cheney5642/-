export type OrderStatus =
  | "WAITING"
  | "IN_SERVICE"
  | "RISK_DETECTED"
  | "RISK_HANDLED"
  | "HIGH_RISK"
  | "HUMAN_REVIEW"
  | "COMPLETED";

export type RiskLevel = "low" | "medium" | "high";

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
}

export interface Order {
  id: string;
  pet: Pet;
  serviceType: string;
  providerName: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  status: OrderStatus;
}

export interface ServiceStep {
  id: string;
  name: string;
  required: boolean;
  completed: boolean;
  completedAt: string | null;
  evidenceRequired: boolean;
}

export interface Observation {
  id: string;
  text: string;
  createdAt: string;
}

export interface Risk {
  id: string;
  level: RiskLevel;
  signals: string[];
  reason: string;
  recommendedActions: string[];
  humanRequired: boolean;
}

export interface RiskAnalysis {
  signals: string[];
  risk_level: RiskLevel;
  reason: string;
  recommended_actions: string[];
  human_required: boolean;
  source?: "llm" | "fallback";
}

export interface RuleIssue {
  code: "PROCESS_MISSING" | "PHOTO_MISSING" | "HUMAN_REVIEW_REQUIRED" | "RISK_UNHANDLED";
  message: string;
  stepId?: string;
}

export interface QualityReport {
  completionRate: number;
  missingSteps: string[];
  risks: Risk[];
  finalStatus: "PASS" | "NEED_REVIEW";
}

export interface BadCase {
  originalInput: string;
  aiOutput: RiskAnalysis;
  failureType: string;
  correctedRiskLevel: RiskLevel;
  createdAt: string;
}
