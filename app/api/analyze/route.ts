import { NextResponse } from "next/server";
import { analyzeRisk } from "@/lib/ai-service";
import type { AnalyzeInput } from "@/lib/fallback-risk-analyzer";

export async function POST(request: Request) {
  try {
    const input = await request.json() as AnalyzeInput;
    if (!input?.pet || !input?.serviceType || typeof input?.observationText !== "string" || !Array.isArray(input?.completedSteps)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json(await analyzeRisk(input));
  } catch {
    return NextResponse.json({ error: "Unable to analyze observation" }, { status: 500 });
  }
}
