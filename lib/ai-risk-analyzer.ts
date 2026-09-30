import type { RiskAnalysis } from "@/lib/types";
import type { AnalyzeInput } from "@/lib/fallback-risk-analyzer";

const ALLOWED_SIGNALS = new Set([
  "hiding_behavior", "reduced_appetite", "low_energy", "persistent_vomiting",
  "unstable_standing", "visible_injury", "pet_missing", "convulsion", "abnormal_breathing",
]);
const ALLOWED_ACTIONS = new Set([
  "observe_pet", "upload_photo", "notify_owner", "stop_automatic_flow", "contact_human_support",
]);

export async function analyzeObservation(input: AnalyzeInput, apiKey: string, model: string): Promise<RiskAnalysis> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "你只做宠物上门服务的风险信号提取，不得诊断疾病、输出病名、推荐药物或剂量、判断责任或赔付。只输出JSON：signals数组、risk_level(low|medium|high)、reason、recommended_actions数组、human_required布尔值。持续呕吐、站立不稳、受伤、走失、抽搐、呼吸异常必须high且human_required=true。",
        },
        {
          role: "user",
          content: JSON.stringify({
            pet: input.pet,
            service_type: input.serviceType,
            observation: input.observationText,
            completed_steps: input.completedSteps.filter((step) => step.completed).map((step) => step.name),
          }),
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`LLM request failed: ${response.status}`);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("LLM returned no content");
  return normalizeAiResult(JSON.parse(content) as Partial<RiskAnalysis>);
}

function normalizeAiResult(raw: Partial<RiskAnalysis>): RiskAnalysis {
  const level = raw.risk_level === "high" || raw.risk_level === "medium" ? raw.risk_level : "low";
  const signals = Array.isArray(raw.signals) ? raw.signals.filter((value): value is string => typeof value === "string" && ALLOWED_SIGNALS.has(value)) : [];
  const actions = Array.isArray(raw.recommended_actions)
    ? raw.recommended_actions.filter((value): value is string => typeof value === "string" && ALLOWED_ACTIONS.has(value))
    : [];
  const humanRequired = level === "high" || raw.human_required === true;
  return {
    signals,
    risk_level: humanRequired ? "high" : level,
    reason: humanRequired
      ? "现场描述包含需要立即人工介入的明显异常信号。"
      : level === "medium"
        ? "现场描述包含需要补充观察的异常信号。"
        : "现场描述未发现明显风险信号。",
    recommended_actions: humanRequired
      ? ["stop_automatic_flow", "contact_human_support", "notify_owner"]
      : level === "medium"
        ? Array.from(new Set([...actions, "observe_pet", "upload_photo", "notify_owner"]))
        : [],
    human_required: humanRequired,
    source: "llm",
  };
}
