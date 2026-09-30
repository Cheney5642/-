import { goldenSummary } from "./golden-cases";

const summary = goldenSummary();
for (const item of summary.results) {
  console.log(`${item.passed ? "PASS" : "FAIL"} Case ${item.id} ${item.name}`);
  for (const failure of item.failures) console.log(`  - ${failure}`);
}
console.log(`Golden Test Result ${summary.passed} / ${summary.total} PASS`);
if (summary.passed !== summary.total) process.exitCode = 1;
