import type { Methodology } from "@/domain/model"

export const METHODOLOGY_LABELS: Record<Methodology, string> = {
  ptes: "PTES",
  osstmm: "OSSTMM",
  owasp_wstg: "OWASP WSTG",
  nist_800_115: "NIST SP 800-115",
  custom: "Custom",
}

/**
 * Phase taxonomies per engagement methodology (FR-1.5). A finding's
 * `methodologyPhase` must be one of the phases of its engagement's
 * methodology — never a free-text value.
 */
export const METHODOLOGY_PHASES: Record<Methodology, readonly string[]> = {
  ptes: [
    "Pre-engagement Interactions",
    "Intelligence Gathering",
    "Threat Modeling",
    "Vulnerability Analysis",
    "Exploitation",
    "Post Exploitation",
    "Reporting",
  ],
  owasp_wstg: [
    "Information Gathering",
    "Configuration and Deployment Management Testing",
    "Identity Management Testing",
    "Authentication Testing",
    "Authorization Testing",
    "Session Management Testing",
    "Input Validation Testing",
    "Error Handling",
    "Cryptography",
    "Business Logic Testing",
    "Client-side Testing",
    "API Testing",
  ],
  nist_800_115: [
    "Planning",
    "Discovery",
    "Attack",
    "Reporting",
  ],
  osstmm: [
    "Scope Definition",
    "Channel Analysis",
    "Security Metrics",
    "Interaction Assessment",
    "Comprehension Audit",
    "Protection Analysis",
    "Reporting",
  ],
  custom: [],
}

export function phasesFor(methodology: Methodology): readonly string[] {
  return METHODOLOGY_PHASES[methodology]
}
