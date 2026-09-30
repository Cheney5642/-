import { analyzeObservation } from "@/lib/ai-risk-analyzer";
import { analyzeWithFallback, type AnalyzeInput } from "@/lib/fallback-risk-analyzer";
import type { RiskAnalysis } from "@/lib/types";

export async function analyzeRisk(input: AnalyzeInput): Promise<RiskAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return analyzeWithFallback(input);

  try {
    return await analyzeObservation(input, apiKey, process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini");
  } catch (error) {
    console.warn("LLM analysis failed; falling back to local analyzer.", error);
    return analyzeWithFallback(input);
  }
}
