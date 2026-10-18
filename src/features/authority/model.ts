import type { AuthorityRule } from "../../types";

export type AuthorityStateFilter = AuthorityRule["state"] | "all";

export interface AuthoritySummary {
  total: number;
  allowed: number;
  forbidden: number;
  required: number;
  sourceCount: number;
}

export function filterAuthorityRules(
  rules: AuthorityRule[],
  query: string,
  state: AuthorityStateFilter,
): AuthorityRule[] {
  const normalizedQuery = query.trim().toLowerCase();
  return rules.filter((rule) => {
    if (state !== "all" && rule.state !== state) return false;
    if (!normalizedQuery) return true;
    return [rule.id, rule.label, rule.state, rule.scope, rule.source, rule.detail]
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });
}

export function summarizeAuthority(rules: AuthorityRule[]): AuthoritySummary {
  return {
    total: rules.length,
    allowed: rules.filter((rule) => rule.state === "allowed").length,
    forbidden: rules.filter((rule) => rule.state === "forbidden").length,
    required: rules.filter((rule) => rule.state === "required").length,
    sourceCount: new Set(rules.map((rule) => rule.source).filter(Boolean)).size,
  };
}
