export const findings = {
  severity: {
    label: "Severity",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    info: "Info",
    none: "None",
    scoreLabel: "CVSS",
    overrideAriaPrefix: "Severity overridden from",
    to: "to",
  },
  status: {
    label: "Status",
    draft: "Draft",
    in_review: "In review",
    changes_requested: "Changes requested",
    approved: "Approved",
    remediated: "Remediated",
    risk_accepted: "Risk accepted",
    false_positive: "False positive",
  },
  classification: {
    internal: "Internal",
    confidential: "Confidential",
    restricted: "Restricted",
  },
  gate: {
    blockedBy: "Blocked by",
    blockerCount: (count: number) =>
      `${count} requirement${count === 1 ? "" : "s"} outstanding`,
    overrideLabel: "Override with reason",
    reasonLabel: "Reason (required)",
    reasonPlaceholder: "Why is this override justified?",
    confirmOverride: "Confirm override",
    cancelOverride: "Cancel",
  },
} as const
