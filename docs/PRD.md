# Product Requirements Document — Dossier v0.2

| | |
|---|---|
| **Product** | Dossier — Security Assessment Reporting Platform |
| **Owner** | Srikanth Sankar |
| **Version** | v0.2 (specification; supersedes v0.1 codebase inventory) |
| **Doc status** | Draft for review |
| **Change from v0.1** | Narrowed to a single beachhead vertical; requirements rewritten as testable acceptance criteria; adds Data Model, Threat Model, Release Criteria, Migration Plan |

---

## 0. How to read this document

v0.1 described what the codebase contains. v0.2 describes what the product must do and how we will know it does it. Implementation status has been moved out of the requirement tables into **Appendix A** so that requirements remain readable as requirements.

Every functional requirement is written as: **user story → acceptance criteria → priority**. If a criterion cannot be turned into a test, it is not a criterion.

Priority scale:

- **P0** — v1.0 will not ship without it
- **P1** — required within one release of v1.0
- **P2** — desirable, schedulable
- **P3** — future consideration

---

## 1. Product Overview

**One-liner:** A reporting platform for penetration testing and security assessment teams that turns findings into consistent, auditable, client-ready deliverables.

**Positioning:** *"Findings in. Report out. Nothing lost in between."*

**Beachhead:** VAPT / security assessment reporting only. All other document verticals (resumes, invoices, certificates, proposals, study material) are deferred — see §12.

### 1.1 Why narrow

v0.1 targeted five personas across six unrelated document types. Those personas share no workflow, no buying centre, and no distribution channel. The security-reporting features are the only ones with a defensible moat: they require domain knowledge (CVSS, CWE, OWASP, PTES, evidence handling, retest cycles) that a generic document builder cannot replicate.

A general-purpose block editor with a Giphy picker competes directly with Notion and loses. A tool that makes it structurally impossible to ship a report with mismatched severity counts competes with a Word template and wins.

---

## 2. Problem Statement

Security teams produce their most important deliverable — the assessment report — in the least structured tool they own. The consequences are predictable and repeatable:

| Failure mode | Root cause | How often |
|---|---|---|
| Severity counts disagree between executive summary, severity table, chart, and appendix | Counts are hand-maintained in four places | Nearly every multi-reviewer report |
| A finding's severity label contradicts its CVSS score | Severity is typed as free text instead of derived from the vector | Common |
| Methodology / phase labels copied uniformly across all findings | Copy-paste template inheritance with no validation | Common |
| Report ships without reviewer sign-off | No workflow gate between "draft" and "export" | Common |
| Evidence does not support the claim in the finding text | Text and screenshots edited independently, no linkage | Common |
| Credentials, tokens, or client PII left in pasted terminal output | No redaction step in the authoring flow | High-impact, low-frequency |
| Retest requires manually diffing two Word files | No finding lifecycle state | Every retest |

Each of these is a **structural** defect, not a discipline problem. A reviewer catching them is a fragile control. The product thesis is that the authoring tool should make them impossible rather than detectable.

### 2.1 Competitive landscape

| Product | Model | Strength | Where Dossier competes |
|---|---|---|---|
| **PlexTrac** | Commercial SaaS | Mature workflow, integrations, analytics | Price; complexity for small teams |
| **AttackForge** | Commercial SaaS | Strong methodology + retest tracking | Price; rigidity of templates |
| **Sysreptor** | Open source / self-host | Excellent design control, HTML→PDF pipeline | Authoring UX; requires technical setup |
| **Ghostwriter** | Open source (SpecterOps) | Red-team ops focus, infra tracking | Report design flexibility |
| **Dradis** | Open source + Pro | Tool import breadth | Modern UI; canvas-level design control |
| **Word + template** | Status quo | Zero cost, universal | Everything in §2 above |

**Dossier's wedge:** the design freedom of a visual studio combined with the data integrity of a structured findings database — aimed at small-to-mid consultancies currently on Word who find PlexTrac/AttackForge over-scoped and over-priced, and Sysreptor/Ghostwriter too technical to deploy.

This claim is an assumption, not a finding. See §13, OQ-1.

---

## 3. Assumptions & Dependencies

| ID | Assumption | Risk if false | Validation |
|---|---|---|---|
| A-1 | Small consultancies will accept a hosted SaaS for client-confidential findings | Fatal to hosted model; forces self-host-first | Customer interviews (OQ-1) |
| A-2 | Teams will adopt CVSS v3.1/v4.0 vectors rather than ad-hoc severity | Structured severity loses value | Interviews; support free-text override with warning |
| A-3 | Report design flexibility is a real purchase driver, not a stated preference | Canvas studio is over-investment | Interviews; compare against fixed-template competitors |
| A-4 | A backend can be delivered before client-confidential data volume grows | Migration pain compounds | Sequencing decision (§11) |

| ID | Dependency | Notes |
|---|---|---|
| D-1 | PDF rendering service | See FR-6; blocks v1.0 |
| D-2 | Authentication provider | Build vs. buy decision open (OQ-2) |
| D-3 | CVSS calculation library | Must support v3.1 **and** v4.0 vectors |
| D-4 | Object storage for evidence | Screenshots must not live in the primary datastore |

---

## 4. Personas

### 4.1 Primary — Security Consultant / VAPT Analyst

Runs engagements, writes findings, assembles the report. Measures success in hours saved per engagement and in never having to issue a corrected report.

- **UC-1** — Create an engagement, add findings with CVSS vectors and evidence, export a branded PDF.
- **UC-2** — Import scanner output (Nmap, Nuclei, Burp) and triage into findings, discarding false positives.
- **UC-3** — Redact credentials and client identifiers from evidence before export.
- **UC-4** — Reuse a finding written on a previous engagement without retyping it.

### 4.2 Primary — Reviewer / Engagement Lead (new in v0.2)

v0.1 omitted this persona entirely, yet the "pending reviews" dashboard stat and the entire class of failures in §2 exist because of them. Reviewers are the gate between draft and delivery.

- **UC-5** — See every finding awaiting review, with what changed since last review.
- **UC-6** — Comment on, request changes to, or approve a finding; approval is recorded and attributable.
- **UC-7** — Sign off on a report; export is blocked until sign-off exists.

### 4.3 Secondary — Client Stakeholder (read-only, P2)

- **UC-8** — Receive a report; optionally view findings in a read-only portal and mark remediation status.

### 4.4 Deferred personas

Job Seeker / Career Coach, Operations Admin, Knowledge Worker, Educator — see §12.

---

## 5. Data Model

v0.1 contained no schema. Without one, the P0 backend cannot be specified, the localStorage migration has no target, and the roll-up integrity requirements in FR-2 cannot be enforced.

### 5.1 Entities

```
Workspace
 ├── User (membership, role)
 ├── Client
 │    └── Engagement
 │         ├── Finding
 │         │    ├── Evidence
 │         │    ├── AffectedAsset
 │         │    └── ReviewEvent
 │         ├── ReportDocument
 │         │    └── DocumentVersion
 │         └── EngagementMember (role on this engagement)
 ├── FindingTemplate  (reusable library)
 └── ReportTemplate   (studio template)
```

### 5.2 Core entity definitions

**Workspace** — tenant boundary. All authorization is evaluated relative to a workspace.
`id (uuid) · name · slug · created_at · retention_policy_days · data_region`

**User**
`id (uuid) · email (unique) · display_name · mfa_enrolled (bool) · status (active|suspended|invited) · last_login_at`

**Membership** — user ↔ workspace, carries the role.
`user_id · workspace_id · role (owner|admin|lead|analyst|read_only) · created_at`

**Client**
`id · workspace_id · name · code (short, appears in finding IDs) · logo_asset_id · confidentiality_default (internal|confidential|restricted)`

**Engagement**
`id · workspace_id · client_id · name · type (webapp|api|network|mobile|cloud|physical|social) · methodology (ptes|osstmm|owasp_wstg|nist_800_115|custom) · scope_text · start_date · end_date · status (scoping|testing|reporting|in_review|delivered|retest|closed) · roe_reference · classification`

> `roe_reference` is **required** before status can leave `scoping`. It records the authorization document ID for the engagement — the single most important audit artifact in a pentest and one that is routinely missing.

**Finding** — the central entity.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Internal |
| `display_id` | string | e.g. `ACME-WEB-F-007`. **Immutable once assigned.** Never renumbered on reorder or deletion |
| `engagement_id` | uuid | |
| `title` | string | |
| `cvss_version` | enum | `3.1` \| `4.0` |
| `cvss_vector` | string | Full vector string, e.g. `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` |
| `cvss_base_score` | decimal(3,1) | **Derived.** Never user-writable |
| `severity` | enum | **Derived** from score. Never user-writable — see FR-1 |
| `severity_override` | enum, nullable | Business-context adjustment |
| `severity_override_reason` | text, nullable | **Required** if override is set |
| `cwe_ids` | array | Enumerated, validated against CWE list |
| `owasp_categories` | array | Validated against selected OWASP list version |
| `cve_ids` | array, nullable | Format-validated |
| `methodology_phase` | enum | Validated against the engagement's `methodology`. **Must not default to a single value across all findings** — see FR-1 |
| `description` | rich text | |
| `impact` | rich text | |
| `remediation` | rich text | |
| `references` | array of URLs | |
| `status` | enum | `draft` \| `in_review` \| `changes_requested` \| `approved` \| `remediated` \| `risk_accepted` \| `false_positive` |
| `retest_status` | enum, nullable | `not_retested` \| `pass` \| `fail` \| `partial` |
| `retest_date` | date, nullable | |
| `retested_by` | uuid, nullable | |
| `author_id` / `approver_id` | uuid | |
| `source_finding_template_id` | uuid, nullable | Provenance when reused from library |
| `created_at` / `updated_at` | timestamp | |

**AffectedAsset**
`id · finding_id · asset_type (host|url|endpoint|parameter|repo|mobile_package) · identifier · environment (prod|uat|dev|staging) · notes`

> A finding may affect many assets. v0.1 had no asset model, which makes per-asset remediation tracking and retest scoping impossible.

**Evidence**
`id · finding_id · kind (image|text|http_exchange|file) · storage_ref · caption · redaction_state (unredacted|redacted|not_required) · redaction_map_ref · sha256 · captured_at · order_index`

> `sha256` is recorded at upload for evidentiary integrity. `redaction_state` gates export — see FR-4.

**ReviewEvent** — append-only.
`id · finding_id · actor_id · action (submitted|commented|changes_requested|approved|revoked) · comment · created_at · finding_snapshot_hash`

**ReportDocument / DocumentVersion**
`ReportDocument: id · engagement_id · report_template_id · title · classification · status (draft|in_review|approved|delivered)`
`DocumentVersion: id · document_id · version_label (semver or r1/r2) · content_json · created_by · created_at · approved_by · approved_at · export_sha256 · is_immutable`

> Once a version is exported and delivered, `is_immutable` is set. Delivered reports are never silently edited; a new version is created.

**FindingTemplate** — library entry for reuse.
`id · workspace_id · title · default_cvss_vector · description · impact · remediation · cwe_ids · owasp_categories · tags · usage_count`

### 5.3 Derived data — single source of truth rule

The following are **computed on read** and must never be stored as editable fields:

- Severity band (from CVSS score)
- Severity counts per band, per engagement
- Total finding count
- Any chart series derived from findings
- Executive summary severity table
- Appendix index

**Acceptance:** it must be impossible to author a document in which two locations display different counts for the same underlying set of findings. This is enforced by rendering all such values from a single query, not by validation.

### 5.4 Identifier policy

`display_id` format: `{client.code}-{engagement.short_code}-F-{NNN}`, zero-padded to three digits, assigned at creation, monotonically increasing per engagement, **never reused and never renumbered**. Deleting a finding leaves a gap; gaps are correct behaviour and must not be "fixed."

---

## 6. Functional Requirements

### FR-1 — Structured finding authoring (P0)

> *As an analyst, I want severity to be derived from the CVSS vector so that a finding's label can never contradict its score.*

**Acceptance criteria**

1. The finding editor exposes a CVSS v3.1 and v4.0 calculator with per-metric controls.
2. The base score is computed client-side and matches the FIRST reference implementation to one decimal place across the full official test-vector set.
3. The severity band is rendered read-only, derived from the score using the standard bands (None 0.0 / Low 0.1–3.9 / Medium 4.0–6.9 / High 7.0–8.9 / Critical 9.0–10.0).
4. There is no code path by which a user can type a severity that disagrees with the computed band. Business-context adjustment is possible only via `severity_override`, which requires a written reason and renders visibly as an override in all outputs.
5. `methodology_phase` options are populated from the engagement's selected methodology. A finding cannot be submitted for review without one set.
6. If **every** finding in an engagement shares the same `methodology_phase`, the pre-review check emits a warning. (This pattern is nearly always a copy-paste artifact rather than a genuine result.)
7. CWE and OWASP fields are typeahead-validated against a versioned reference list. Free text is rejected.
8. Saving a finding with an empty `description`, `impact`, or `remediation` is permitted in `draft` and blocked on submit-for-review.

### FR-2 — Roll-up integrity (P0)

> *As a lead, I want every count in the report to come from the findings themselves so that the numbers cannot disagree.*

**Acceptance criteria**

1. Severity counts, totals, charts, and the appendix index are rendered from the live finding set at document-render time.
2. No element type permits a hand-entered severity count. The `severityBadge` and summary-table elements bind to a query, not to a literal.
3. Changing a finding's CVSS vector updates every derived display in the document without a manual refresh step.
4. A test fixture with 33 findings across five bands renders identical counts in the executive summary, the severity table, the distribution chart, and the appendix. This is a CI test, not a manual check.

### FR-3 — Review and sign-off workflow (P0)

> *As a lead, I want export blocked until findings are approved so that unreviewed work cannot reach a client.*

**Acceptance criteria**

1. Finding status transitions follow the state machine in §5.2 and are enforced server-side. Illegal transitions return an error.
2. Only users with `lead`, `admin`, or `owner` role on the engagement may approve.
3. A user cannot approve a finding they authored, unless the workspace explicitly enables self-approval (off by default).
4. Every transition writes an append-only `ReviewEvent` with actor, timestamp, and a hash of the finding content at that moment.
5. If an approved finding is subsequently edited, its status reverts to `changes_requested` and the approver is notified. Approval does not survive content change.
6. Exporting a document at classification `confidential` or above requires all included findings to be `approved` and requires a recorded document-level sign-off.
7. The reviewer queue shows a per-finding diff since last review.

### FR-4 — Evidence handling and redaction (P0)

> *As an analyst, I want to redact secrets from evidence before export so that credentials never leave in a deliverable.*

**Acceptance criteria**

1. Text evidence is scanned on paste against a configurable detector set (API keys, bearer/JWT tokens, private keys, AWS/Azure/GCP credentials, email addresses, national ID patterns, credit-card patterns via Luhn). Matches are highlighted.
2. Redaction replaces the underlying stored value. It is not a visual overlay. A redacted screenshot has the pixels destroyed; a redacted string has the characters removed from storage.
3. Image redaction is destructive and re-encodes the image. The original is discarded unless the workspace opts into retaining originals in a separate, access-controlled store.
4. Export is blocked while any evidence item on an included finding has `redaction_state = unredacted` and has unresolved detector matches. The block is overridable by a lead with a recorded reason.
5. Every evidence item's SHA-256 is recorded at upload and displayed in the evidence appendix.
6. Evidence is stored in object storage, referenced by ID — never inlined as base64 in the document payload.

### FR-5 — Findings library and reuse (P1)

**Acceptance criteria**

1. Any finding can be saved to the workspace library, with client-specific details stripped by a guided step (assets, evidence, and client name are excluded by default).
2. Inserting from the library pre-fills title, description, impact, remediation, CVSS vector, CWE, and OWASP fields; all remain editable.
3. Provenance is recorded via `source_finding_template_id`.
4. Library entries are versioned; updating an entry does not retroactively alter findings already created from it.

### FR-6 — Export (P0)

> *As an analyst, I want a text-based, navigable PDF so that the deliverable is professional and usable.*

v0.1's `html-to-image → jsPDF` pipeline rasterizes the DOM. It produces image-only PDFs with no selectable text, no bookmarks, no cross-references, no page-break control, no accessibility tags, and unbounded file size. A 100-page report with 60 screenshots is not deliverable through it. This requirement replaces that pipeline.

**Acceptance criteria**

1. Exported PDF contains selectable, searchable text. Rasterization is used only for genuine images.
2. Table of contents with working internal links; PDF bookmarks mirror the heading structure.
3. Page-break control: a finding block does not split across pages unless it exceeds one page, in which case it breaks at a defined boundary and repeats the finding header.
4. Headers and footers carry the classification marking and client name on every page: `CONFIDENTIAL — {{client.name}}`.
5. Optional diagonal watermark at document level.
6. Page numbering in `Page N of M` form, with front matter numbered separately.
7. A 120-page reference report with 60 screenshots exports in under 60 seconds and under 25 MB.
8. Fidelity is measured as pixel-diff ≤ 2% against reference renders across a fixture set of at least 10 templates, run in CI. (This replaces the unmeasurable "99% WYSIWYG" metric in v0.1 §6.)
9. Export produces a SHA-256 recorded against the `DocumentVersion`.

**Note:** criteria 1–3 and 7 are not achievable client-side at this scale. Server-side rendering is therefore **in scope** for v1.0, reversing v0.1 §8.

### FR-7 — Retest and delta reporting (P1)

**Acceptance criteria**

1. An engagement can be cloned into a retest engagement, carrying findings forward with status `not_retested`.
2. Each finding records retest outcome, date, and tester.
3. A delta report renders three sections: resolved, still open, newly identified.
4. Findings resolved in retest retain their original `display_id`.

### FR-8 — Scanner import and triage (P1)

**Acceptance criteria**

1. Import parsers for Nmap XML, Nuclei JSONL, Burp Suite XML, and generic CSV.
2. Imported items land in a triage queue, not directly in the report.
3. Triage actions: promote to finding, merge into existing finding, mark false positive (with reason), discard.
4. Imported files are size-capped, parsed with external entity resolution disabled, and archive-bomb guarded. See TM-4.
5. False-positive decisions are retained and suppress the same signature on subsequent imports within the engagement.

### FR-9 — Document studio (P0, scope-reduced)

The canvas studio is retained but its element registry is refocused. Retained: text, heading, image, shape, divider, container, header, footer, pageNumber, table, chart, list, code, link, callout, badge, severityBadge, finding, evidence, apiRequest, testCaseTable.

**Removed from v1.0:** `eduBox`, `progress`, `checklist`, `embed`.

**Acceptance criteria**

1. Data-bound elements (`finding`, `severityBadge`, `testCaseTable`, charts, summary tables) bind to queries over the engagement's finding set, per FR-2.
2. `{{variable}}` is **string substitution only**. No expression evaluation, no property traversal beyond a fixed allowlist of exposed fields, no function calls. This is a security requirement — see TM-5.
3. System variables: `page_number`, `total_pages`, `client_name`, `engagement_name`, `classification`, `report_version`, `export_date`.
4. Version snapshots are stored server-side with no count cap; the v0.1 limit of 20 was a localStorage artifact.

### FR-10 — Authentication, authorization, and audit (P0)

> v0.1 shipped mock MFA, mock trusted devices, and a mock activity log. A fake audit log that renders like a real one is worse than none: it invites reliance it cannot support.

**Acceptance criteria**

1. Server-side sessions with idle timeout (default 30 min) and absolute timeout (default 12 h), both workspace-configurable.
2. TOTP MFA, enforceable as a workspace requirement. Recovery codes issued once, hashed at rest.
3. RBAC per §5.2 roles, evaluated server-side on every request. Client-side role checks are presentation only.
4. The audit log is server-generated and append-only. Clients cannot write to it. Entries: actor, action, target, IP, user agent, timestamp, workspace.
5. Audited events at minimum: login success/failure, MFA enrollment and reset, role change, engagement create/delete, finding approve/revoke, export, evidence download, redaction override, ROE reference change.
6. **Release gate:** any screen presenting security state that is not backed by real server data must be feature-flagged off or carry a persistent non-functional label. This applies to trusted devices and the activity log until FR-10.4 ships.

### FR-11 — Data protection at rest and in transit (P0)

See §7 for the threat rationale.

**Acceptance criteria**

1. Documents are classified `internal` / `confidential` / `restricted`. Engagement classification defaults from the client record.
2. Client-side persistence of `confidential` or `restricted` content is prohibited. Drafts sync to the server; offline editing is limited to an explicitly opted-in encrypted cache (WebCrypto AES-GCM, key derived from a passphrase via PBKDF2/Argon2, never stored in plaintext).
3. All local caches are wiped on logout, on session expiry, and on workspace switch.
4. TLS 1.2+ enforced; HSTS with a minimum 1-year max-age.
5. Evidence objects are served via short-lived signed URLs, never public.
6. Per-workspace retention policy with automated deletion and a documented hard-delete path.
7. Data region is a workspace-level setting (A-1 dependency).

### FR-12 — Backup and durability (P0)

v0.1 stored all user work in localStorage. Clearing browser data destroyed every document with no recovery path. This was not listed as a risk.

**Acceptance criteria**

1. Server-side persistence with point-in-time recovery, RPO ≤ 15 min, RTO ≤ 4 h.
2. User-initiated "export everything" producing a portable archive (JSON + evidence files).
3. Quota and storage-limit conditions surface as explicit errors. Silent save failure is a P0 defect class.

---

## 7. Threat Model

Scope: the studio, the import path, the export path, evidence storage, and the authoring client. Method: STRIDE per data flow.

### 7.1 Assets, ranked

1. Unremediated vulnerability details for live client systems
2. Credentials, tokens, and keys captured in evidence
3. Client PII appearing incidentally in evidence
4. Engagement scope and ROE documents
5. Report templates and workspace branding
6. Platform user credentials and sessions

Asset 1 is the reason this product is a high-value target. A compromised Dossier workspace hands an attacker a prioritized, pre-validated, reproducible attack plan against every client the consultancy serves.

### 7.2 Threat register

| ID | Threat | STRIDE | Vector | Mitigation | Req |
|---|---|---|---|---|---|
| TM-1 | XSS in the studio or preview reads all local data | Information Disclosure, Elevation | Sanitizer bypass, `dangerouslySetInnerHTML` regression, malicious template import | Nonce-based CSP; pinned DOMPurify config; no client-side persistence of confidential content; HttpOnly session cookies | FR-11, §7.3 |
| TM-2 | Malicious browser extension exfiltrates localStorage | Information Disclosure | Any extension with host permissions | Do not persist confidential content client-side; encrypted opt-in cache only | FR-11.2 |
| TM-3 | Shared/unlocked workstation exposes an open session | Information Disclosure | Physical | Idle timeout; wipe on logout; MFA on re-auth | FR-10.1, FR-11.3 |
| TM-4 | Malicious scanner import — XXE, zip bomb, SSRF via external entity, path traversal in archive | Information Disclosure, DoS | `mammoth` DOCX import, PDF import, XML scanner import | Disable external entity resolution; size and entity-expansion caps; parse in an isolated worker with no network; sanitize resulting HTML through the same pinned config; reject absolute and `..` paths | FR-8.4, FR-9 |
| TM-5 | Template injection via `{{variable}}` | Elevation, Information Disclosure | Expression evaluation reaching a server-side renderer | Substitution-only, fixed allowlist of exposed fields, no traversal, no function calls | FR-9.2 |
| TM-6 | Server-side PDF renderer SSRF or local file read | Information Disclosure | Headless browser fetching attacker-controlled URLs; `file://`, cloud metadata endpoints | Render in a network-egress-denied sandbox; allowlist asset origins; block link-local and metadata ranges; no `file://` | FR-6 |
| TM-7 | LaTeX compilation RCE (if server-side LaTeX is ever added) | Elevation | `\write18`, `\input`, `\openin` | Do not add server-side LaTeX. If required: restricted-shell-escape-off, sandboxed container, no network, CPU and wall-clock limits | §12 |
| TM-8 | Cross-tenant data access | Information Disclosure, Elevation | Missing workspace scoping in a query | Workspace ID enforced at the data-access layer, not per-handler; automated tests attempting cross-tenant reads | FR-10.3 |
| TM-9 | Insider or compromised account exfiltrates all findings | Information Disclosure | Legitimate credentials | RBAC least privilege; audit every export and evidence download; anomaly alerting on bulk download | FR-10.4/.5 |
| TM-10 | Unredacted secrets shipped in a deliverable | Information Disclosure | Human error | Detector scan; export block; destructive redaction; override requires reason and is audited | FR-4 |
| TM-11 | Delivered report silently altered after the fact | Tampering, Repudiation | Editing a delivered version | Immutable delivered versions; export SHA-256 recorded; new revisions only | §5.2 |
| TM-12 | Approval forged or attributed incorrectly | Repudiation | Weak workflow controls | Append-only ReviewEvent with content hash; approval invalidated on edit | FR-3.4/.5 |
| TM-13 | Evidence URL leaks via referrer or sharing | Information Disclosure | Long-lived public URLs | Short-lived signed URLs; `Referrer-Policy: no-referrer`; download audited | FR-11.5 |
| TM-14 | Denial of service via oversized documents | DoS | 500-page document, 10 000 elements | Enforced limits per §8; graceful degradation with explicit error | §8 |

### 7.3 Baseline browser security headers

Required on all application responses:

```
Content-Security-Policy: default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'nonce-{random}';
  img-src 'self' blob: data: {evidence-cdn};
  connect-src 'self' {api-origin};
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'none';
  form-action 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(), camera=(), microphone=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

No `unsafe-inline`, no `unsafe-eval`. Any dependency requiring either is disqualified.

### 7.4 Sanitizer configuration

"DOMPurify everywhere" is not a specification. The pinned configuration:

- Allowed URI schemes: `https`, `mailto` only. No `data:` in `href`, no `javascript:`.
- `style` attribute stripped; presentation via classes only.
- All event handler attributes stripped.
- `SAFE_FOR_TEMPLATES` enabled.
- `target="_blank"` forced to carry `rel="noopener noreferrer"`.
- Sanitization occurs **on write** (at import/paste) **and on render**. Defence in depth; neither is sufficient alone.
- Configuration lives in one module, is unit-tested against a bypass corpus, and is not overridable at call sites.

---

## 8. Non-Functional Requirements

| NFR | Requirement | Measurement |
|---|---|---|
| Performance — bundle | Initial JS ≤ 250 kB gzipped; no single lazy chunk > 400 kB | CI bundle-size gate; v0.1 baseline was 846 kB |
| Performance — TTI | ≤ 3.0 s on a mid-tier laptop, simulated Fast 3G | Lighthouse CI |
| Performance — canvas | ≥ 30 fps drag/resize at 200 elements on a page | Automated frame-timing harness |
| Performance — export | ≤ 60 s for the 120-page reference report | CI timing test |
| Scale limits | 500 pages/document · 300 elements/page · 25 MB/evidence item · 2 GB/engagement · 1 000 findings/engagement | Enforced with explicit errors, never silent truncation |
| Availability | 99.5% monthly for the hosted service | Uptime monitoring |
| Durability | RPO ≤ 15 min, RTO ≤ 4 h | Quarterly restore drill |
| Browser support | Chrome, Edge, Firefox, Safari — current and current-1 | Cross-browser CI |
| Accessibility | WCAG 2.2 AA for the application; exported PDFs tagged, with contrast checked on the generated output, not only on screen | axe-core in CI + manual audit per release |
| Observability | Structured logs, error reporting with PII scrubbing, trace IDs surfaced in the UI for support | Error budget review |
| i18n | English at v1.0. Externalized strings retained; locale negotiation, ICU message format, RTL layout, and locale-aware date/number formatting are P2. v0.1's "i18n-ready" claim covered only string externalization, roughly 20% of the work | Pseudo-locale render test |
| Testing | Unit coverage ≥ 70% on the engine; 100% of element renderers under snapshot test; export fidelity fixtures; cross-tenant authorization tests; sanitizer bypass corpus | CI gates |
| Supply chain | Lockfile committed; automated dependency scanning; SBOM per release; no dependency requiring `unsafe-eval` | CI |

**Note on testing priority:** v0.1 listed tests as P1 with none written. For a document engine whose entire value is output correctness, renderer and export tests are P0. A rendering regression is invisible until it reaches a client.

---

## 9. Success Metrics & Instrumentation

v0.1 defined five metrics, none of which could be collected — there was no backend and no analytics. v0.2 pairs each metric with its instrument.

| Metric | Target | Instrument |
|---|---|---|
| Time from engagement creation to first exported report | Median ≤ 4 h of active editing | Server-side event timestamps |
| Findings created from library vs. from blank | ≥ 50% from library by month 3 | `source_finding_template_id` presence |
| Reports exported with zero post-delivery corrections | ≥ 95% | Count of new versions created after `delivered` |
| Review turnaround (submit → approve) | Median ≤ 24 h | ReviewEvent timestamps |
| Export success rate | ≥ 99.5% | Export job outcomes |
| Export fidelity | Pixel-diff ≤ 2% across fixture set | CI, not production telemetry |
| WAU/MAU | ≥ 40% | Session events |

**Instrumentation constraints.** The buyer is a security team; they will audit telemetry before adopting. Therefore: no third-party analytics scripts in the application; events collected first-party only; the event schema is published in the documentation; no document content, finding text, evidence, or client names ever enter an analytics payload — IDs and counts only; product analytics is opt-out at workspace level and off by default for `restricted` workspaces.

---

## 10. Release Criteria (Definition of Done for v1.0)

v1.0 ships only when all of the following hold:

1. All P0 functional requirements meet their acceptance criteria.
2. No mock-backed screen presents itself as functional (FR-10.6).
3. Every threat in §7.2 has an implemented mitigation or a documented, signed risk acceptance.
4. The security headers in §7.3 are present in production and verified by an automated check.
5. An independent penetration test of Dossier itself is complete, with all High and Critical findings remediated. *A security reporting tool that has not been tested cannot credibly be sold to security teams.*
6. Cross-tenant authorization tests pass.
7. Export fidelity fixtures pass at the §8 threshold.
8. Restore drill completed successfully against production-shaped data.
9. Accessibility audit passes WCAG 2.2 AA with no open Serious/Critical issues.
10. Migration path from v0.1 localStorage validated against real user data (§14).
11. Documented incident response and breach notification process, given the asset sensitivity in §7.1.

---

## 11. Roadmap

**Phase 1 — Make it real (blocks everything)**
Backend, auth, RBAC, real audit log, server persistence, migration from localStorage, security headers, CI test harness.

**Phase 2 — Make it correct**
FR-1 structured findings, FR-2 roll-up integrity, FR-3 review workflow, FR-4 redaction, FR-6 export rewrite.

**Phase 3 — Make it fast**
FR-5 findings library, FR-8 scanner import, FR-7 retest delta.

**Phase 4 — Make it collaborative**
Presence, comments, multi-user editing, client read-only portal.

**Phase 5 — Expand**
Additional verticals, only after the beachhead is validated against §9.

---

## 12. Out of Scope for v1.0

| Item | Rationale |
|---|---|
| Resume Creator (LaTeX) | Different persona, no workflow overlap. Retain the code, remove from the product surface. Server-side LaTeX is permanently excluded — see TM-7 |
| Invoices, certificates, proposals, study material | Deferred verticals; revisit after beachhead validation |
| Notepad block editor, Giphy picker, `eduBox` | Commodity functionality competing with Notion; not a purchase driver for the target buyer. The Giphy integration additionally introduces a third-party origin into CSP for no security-buyer value |
| Projects and Pages tree | Superseded by the Client → Engagement hierarchy in §5.1 |
| Real-time co-editing | Phase 4 |
| E-signatures | Phase 5 |
| Native mobile apps | Remove app-store badges from the landing page until real. They currently advertise a product that does not exist |

**Reversed from v0.1 §8:** server-side PDF rendering is now **in scope** (FR-6); granular RBAC is now **in scope** (FR-10.3). v0.1 conflated MFA with RBAC — MFA is authentication, RBAC is authorization, and excluding the latter also precluded multi-tenancy, which contradicted v0.1's own "active users" dashboard metric.

---

## 13. Open Questions

| ID | Question | Owner | Needed by |
|---|---|---|---|
| OQ-1 | Will target customers accept hosted SaaS for client-confidential findings, or is self-host table stakes? | Product | Before Phase 1 architecture |
| OQ-2 | Build auth or adopt an identity provider? Does the buyer require SSO/SAML at v1.0? | Eng | Phase 1 start |
| OQ-3 | CVSS v3.1, v4.0, or both at v1.0? Which do target customers' clients require? | Product | Before FR-1 |
| OQ-4 | Which methodology taxonomies ship as built-ins — PTES, OWASP WSTG, NIST 800-115? Is custom needed at v1.0? | Product | Before FR-1 |
| OQ-5 | Pricing model and per-seat vs. per-engagement | Product | Before v1.0 |
| OQ-6 | Data residency requirements by target market | Product/Legal | Phase 1 architecture |
| OQ-7 | Does the buyer require SOC 2 or ISO 27001 before purchase? | Product | Affects Phase 1 sequencing |

---

## 14. Migration Plan (v0.1 localStorage → backend)

1. Ship a client-side export producing a portable archive of all `dossier.*.v1` keys before any breaking change.
2. Ship an importer that maps v0.1 document JSON onto the §5 schema. Elements with no v0.2 equivalent (`eduBox`, `progress`, `checklist`, `embed`) convert to static content with a conversion note, never silently dropped.
3. Present a one-time migration prompt on first login post-backend, with a preview of what will be imported and an explicit confirm.
4. Retain the local archive for 30 days post-migration, then wipe.
5. Data loss during migration is a P0 defect. Validate against real user data before general release.

---

## Appendix A — v0.1 Implementation Status

Retained from v0.1 for reference. This records what exists; it is not a statement of requirement satisfaction. Screens marked "mock" do not satisfy their corresponding v0.2 requirements.

| Module | v0.1 status | v0.2 disposition |
|---|---|---|
| Splash, landing, marketing | Built | Retain; remove app-store badges |
| Auth (login, signup, reset, MFA) | UI only, mock | Rebuild against real backend (FR-10) |
| Dashboard | Built, mock data | Rebind to real queries (FR-2) |
| Template library | Built | Retain |
| PDF/DOCX import | Built (mammoth) | Retain; harden (TM-4) |
| Canvas editor | Built | Retain |
| Element registry (26 types) | Built | Reduce to 21 (FR-9) |
| Theming | Built | Retain |
| Variables | Built | Constrain to substitution-only (FR-9.2) |
| Versioning (max 20) | Built | Move server-side, remove cap |
| Reusable components | Built | Retain |
| Inline editing | Built | Retain |
| Export (html-to-image → jsPDF) | Built | **Replace** (FR-6) |
| Documents / dossiers | UI only, mock | Rebuild on §5 schema |
| Resume Creator | Built | Remove from product surface |
| Projects, Pages | UI only, mock | Superseded by Client → Engagement |
| Notepad | Built | Remove from v1.0 |
| Settings, security centre, audit log | UI only, mock | Feature-flag off until FR-10.4 |
