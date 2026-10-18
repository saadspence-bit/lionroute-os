import type { EvidenceItem } from "../../types";

export type EvidenceKindFilter = EvidenceItem["kind"] | "all";
export type EvidenceStatusFilter = EvidenceItem["status"] | "all";

export interface EvidenceSummary {
  total: number;
  verified: number;
  pending: number;
  sourceCount: number;
}

export function evidenceRecordedMs(item: EvidenceItem): number | undefined {
  const parsed = Date.parse(item.recordedAt);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function sortEvidenceNewestFirst(evidence: EvidenceItem[]): EvidenceItem[] {
  return [...evidence].sort((left, right) => (evidenceRecordedMs(right) ?? -1) - (evidenceRecordedMs(left) ?? -1));
}

export function filterEvidence(
  evidence: EvidenceItem[],
  query: string,
  kind: EvidenceKindFilter,
  status: EvidenceStatusFilter,
): EvidenceItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  return sortEvidenceNewestFirst(evidence).filter((item) => {
    if (kind !== "all" && item.kind !== kind) return false;
    if (status !== "all" && item.status !== status) return false;
    if (!normalizedQuery) return true;
    return [item.id, item.kind, item.title, item.result, item.status, item.source, item.detail]
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });
}

export function summarizeEvidence(evidence: EvidenceItem[]): EvidenceSummary {
  return {
    total: evidence.length,
    verified: evidence.filter((item) => item.status === "verified").length,
    pending: evidence.filter((item) => item.status === "pending").length,
    sourceCount: new Set(evidence.map((item) => item.source).filter(Boolean)).size,
  };
}
