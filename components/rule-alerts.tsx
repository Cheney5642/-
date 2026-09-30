import type { RuleIssue } from "@/lib/types";

export function RuleAlerts({ issues }: { issues: RuleIssue[] }) {
  if (!issues.length) return null;
  const primary = issues.find((issue) => issue.code === "HUMAN_REVIEW_REQUIRED")
    || issues.find((issue) => issue.code === "PHOTO_MISSING")
    || issues[0];
  const missingCount = issues.filter((issue) => issue.code === "PROCESS_MISSING").length;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amberSoft p-4 text-amber-950" role="alert">
      <p className="text-sm font-semibold">暂不能完成服务</p>
      <p className="mt-1 text-sm leading-6">{primary.message}{missingCount > 1 ? ` 另有 ${missingCount - 1} 个必做步骤未完成。` : ""}</p>
    </div>
  );
}
