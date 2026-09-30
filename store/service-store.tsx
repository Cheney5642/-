"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { initialSteps, mockOrder } from "@/lib/mock-data";
import { canCompleteOrder, evaluateRules } from "@/lib/rule-engine";
import { statusAfterHumanTaskCreated, statusAfterMediumActions, statusFromRisk } from "@/lib/risk-engine";
import type { BadCase, Order, RiskAnalysis, RuleIssue, ServiceStep } from "@/lib/types";

type MediumAction = "observe_pet" | "upload_photo" | "notify_owner";

interface ServiceStore {
  order: Order;
  steps: ServiceStep[];
  observationText: string;
  analysis: RiskAnalysis | null;
  ruleIssues: RuleIssue[];
  mediumActions: Record<MediumAction, boolean>;
  humanTaskId: string | null;
  badCaseAdded: boolean;
  analyzing: boolean;
  completeStep: (id: string) => void;
  setObservationText: (text: string) => void;
  submitAnalysis: () => Promise<boolean>;
  completeMediumAction: (action: MediumAction) => void;
  createHumanReview: () => void;
  tryCompleteOrder: () => boolean;
  addBadCase: (failureType: string, correctedRiskLevel: RiskAnalysis["risk_level"]) => void;
}

const ServiceContext = createContext<ServiceStore | null>(null);

export function ServiceProvider({ children }: { children: ReactNode }) {
  const [order, setOrder] = useState<Order>(mockOrder);
  const [steps, setSteps] = useState<ServiceStep[]>(initialSteps);
  const [observationText, setObservationText] = useState("");
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [ruleIssues, setRuleIssues] = useState<RuleIssue[]>([]);
  const [mediumActions, setMediumActions] = useState<Record<MediumAction, boolean>>({
    observe_pet: false,
    upload_photo: false,
    notify_owner: false,
  });
  const [humanTaskId, setHumanTaskId] = useState<string | null>(null);
  const [badCaseAdded, setBadCaseAdded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const completeStep = (id: string) => {
    setSteps((current) => current.map((step) =>
      step.id === id ? { ...step, completed: true, completedAt: new Date().toISOString() } : step,
    ));
    setRuleIssues((current) => current.filter((issue) => issue.stepId !== id));
  };

  const submitAnalysis = async () => {
    if (!observationText.trim()) {
      setRuleIssues([{ code: "PROCESS_MISSING", message: "请先填写现场备注。", stepId: "observation" }]);
      return false;
    }

    const nextSteps = steps.map((step) => step.id === "observation"
      ? { ...step, completed: true, completedAt: new Date().toISOString() }
      : step);
    setSteps(nextSteps);
    setRuleIssues(evaluateRules(nextSteps));
    setAnalyzing(true);
    setBadCaseAdded(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet: order.pet,
          serviceType: order.serviceType,
          observationText,
          completedSteps: nextSteps,
        }),
      });
      if (!response.ok) throw new Error("分析服务暂不可用");
      const result = await response.json() as RiskAnalysis;
      setAnalysis(result);
      setMediumActions({ observe_pet: false, upload_photo: false, notify_owner: false });
      setOrder((current) => ({
        ...current,
        status: statusFromRisk(result),
      }));
      return true;
    } catch {
      setRuleIssues((current) => [
        ...current.filter((issue) => issue.code !== "RISK_UNHANDLED"),
        { code: "RISK_UNHANDLED", message: "风险检查未完成，请重试。" },
      ]);
      return false;
    } finally {
      setAnalyzing(false);
    }
  };

  const completeMediumAction = (action: MediumAction) => {
    setMediumActions((current) => {
      const next = { ...current, [action]: true };
      if (Object.values(next).every(Boolean)) {
        setOrder((existing) => ({ ...existing, status: statusAfterMediumActions(true) }));
      }
      return next;
    });
  };

  const createHumanReview = () => {
    setHumanTaskId("QC-1024");
    setOrder((current) => ({ ...current, status: statusAfterHumanTaskCreated() }));
  };

  const tryCompleteOrder = () => {
    const result = canCompleteOrder(steps, analysis, order.status);
    setRuleIssues(result.issues);
    if (!result.allowed) return false;
    setOrder((current) => ({ ...current, status: "COMPLETED", actualEnd: new Date().toISOString() }));
    return true;
  };

  const addBadCase = (failureType: string, correctedRiskLevel: RiskAnalysis["risk_level"]) => {
    if (!analysis) return;
    const badCase: BadCase = {
      originalInput: observationText,
      aiOutput: analysis,
      failureType,
      correctedRiskLevel,
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("xiaobu-bad-cases") || "[]") as BadCase[];
    localStorage.setItem("xiaobu-bad-cases", JSON.stringify([...existing, badCase]));
    setBadCaseAdded(true);
  };

  const value = useMemo(() => ({
    order, steps, observationText, analysis, ruleIssues, mediumActions, humanTaskId,
    badCaseAdded, analyzing, completeStep, setObservationText, submitAnalysis,
    completeMediumAction, createHumanReview, tryCompleteOrder, addBadCase,
  }), [order, steps, observationText, analysis, ruleIssues, mediumActions, humanTaskId, badCaseAdded, analyzing]);

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>;
}

export function useServiceStore() {
  const context = useContext(ServiceContext);
  if (!context) throw new Error("useServiceStore must be used inside ServiceProvider");
  return context;
}
