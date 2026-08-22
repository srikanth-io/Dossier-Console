import type { CvssVersion, SeverityBand } from "@/domain/cvss"

export type WorkspaceRole = "owner" | "admin" | "lead" | "analyst" | "read_only"

export type UserStatus = "active" | "suspended" | "invited"

export interface Workspace {
  id: string
  name: string
  slug: string
  createdAt: string
  retentionPolicyDays: number
  dataRegion: string
}

export interface User {
  id: string
  email: string
  displayName: string
  mfaEnrolled: boolean
  status: UserStatus
  lastLoginAt: string | null
}

export interface Membership {
  userId: string
  workspaceId: string
  role: WorkspaceRole
  createdAt: string
}

export type Confidentiality =
  | "internal"
  | "confidential"
  | "restricted"

export interface Client {
  id: string
  workspaceId: string
  name: string
  code: string
  logoAssetId: string | null
  confidentialityDefault: Confidentiality
}

export type EngagementType =
  | "webapp"
  | "api"
  | "network"
  | "mobile"
  | "cloud"
  | "physical"
  | "social"

export type Methodology =
  | "ptes"
  | "osstmm"
  | "owasp_wstg"
  | "nist_800_115"
  | "custom"

export type EngagementStatus =
  | "scoping"
  | "testing"
  | "reporting"
  | "in_review"
  | "delivered"
  | "retest"
  | "closed"

export interface Engagement {
  id: string
  workspaceId: string
  clientId: string
  name: string
  shortCode: string
  type: EngagementType
  methodology: Methodology
  scopeText: string
  startDate: string
  endDate: string | null
  status: EngagementStatus
  roeReference: string | null
  classification: Confidentiality
}

export type FindingStatus =
  | "draft"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "remediated"
  | "risk_accepted"
  | "false_positive"

export type RetestStatus = "not_retested" | "pass" | "fail" | "partial"

export interface Finding {
  id: string
  displayId: string
  engagementId: string
  title: string
  cvssVersion: CvssVersion
  cvssVector: string
  cvssBaseScore: number
  severity: SeverityBand
  severityOverride: SeverityBand | null
  severityOverrideReason: string | null
  cweIds: string[]
  owaspCategories: string[]
  cveIds: string[] | null
  methodologyPhase: string | null
  description: string
  impact: string
  remediation: string
  references: string[]
  status: FindingStatus
  retestStatus: RetestStatus | null
  retestDate: string | null
  retestedBy: string | null
  authorId: string
  approverId: string | null
  sourceFindingTemplateId: string | null
  createdAt: string
  updatedAt: string
}

export type AssetType =
  | "host"
  | "url"
  | "endpoint"
  | "parameter"
  | "repo"
  | "mobile_package"

export type AssetEnvironment = "prod" | "uat" | "dev" | "staging"

export interface AffectedAsset {
  id: string
  findingId: string
  assetType: AssetType
  identifier: string
  environment: AssetEnvironment
  notes: string | null
}

export type EvidenceKind = "image" | "text" | "http_exchange" | "file"

export type RedactionState = "unredacted" | "redacted" | "not_required"

export interface Evidence {
  id: string
  findingId: string
  kind: EvidenceKind
  storageRef: string
  caption: string | null
  redactionState: RedactionState
  redactionMapRef: string | null
  sha256: string
  capturedAt: string
  orderIndex: number
}

export type ReviewAction =
  | "submitted"
  | "commented"
  | "changes_requested"
  | "approved"
  | "revoked"

export interface ReviewEvent {
  id: string
  findingId: string
  actorId: string
  action: ReviewAction
  comment: string | null
  createdAt: string
  findingSnapshotHash: string
}

export type DocumentStatusV2 = "draft" | "in_review" | "approved" | "delivered"

export interface ReportDocument {
  id: string
  engagementId: string
  reportTemplateId: string
  title: string
  classification: Confidentiality
  status: DocumentStatusV2
}

export interface DocumentVersion {
  id: string
  documentId: string
  versionLabel: string
  contentJson: unknown
  createdBy: string
  createdAt: string
  approvedBy: string | null
  approvedAt: string | null
  exportSha256: string | null
  isImmutable: boolean
}

export interface FindingTemplate {
  id: string
  workspaceId: string
  title: string
  defaultCvssVector: string
  description: string
  impact: string
  remediation: string
  cweIds: string[]
  owaspCategories: string[]
  tags: string[]
  usageCount: number
}
