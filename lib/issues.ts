export type Issue =
  | { code: "bad-format" }
  | { code: "empty" }
  | { code: "too-many" }
  | { code: "count"; file: number; form: number }
  | { code: "row-name"; row: number }
  | { code: "row-age"; row: number }
  | { code: "row-gender"; row: number }
  | { code: "row-region"; row: number; value: string }
  | { code: "row-district"; row: number }
  | { code: "row-org"; row: number }
  | { code: "duplicate"; row: number; name: string; other: number }
  | { code: "external"; row: number; name: string; delegation: string }
  | { code: "more"; count: number };

export function capIssues(issues: Issue[], limit = 30) {
  if (issues.length <= limit) return issues;
  return [...issues.slice(0, limit), { code: "more", count: issues.length - limit } as const];
}
