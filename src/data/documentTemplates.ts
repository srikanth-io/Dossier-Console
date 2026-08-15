import { createElement } from "@/document-engine/registry"
import { uid } from "@/document-engine/history"
import { sizedPage } from "@/document-engine/pageSizes"
import { themePresetById } from "@/document-engine/themes"
import type {
  DocDocument,
  DocElement,
  DocPage,
  LibraryDocument,
  Orientation,
  PageSizeId,
  TemplateCategory,
  DocVariable,
} from "@/document-engine/types"

const nowIso = (daysAgo = 0) =>
  new Date(Date.now() - daysAgo * 86_400_000).toISOString()

function page(
  sizeId: PageSizeId,
  orientation: Orientation,
  name: string,
  elements: DocElement[]
): DocPage {
  const size = sizedPage(sizeId, orientation)
  return {
    id: uid(),
    name,
    sizeId,
    width: size.width,
    height: size.height,
    orientation,
    background: "#ffffff",
    elements,
  }
}

interface TemplateOptions {
  id: string
  name: string
  description: string
  category: TemplateCategory
  type: string
  author: string
  version: string
  createdAtDaysAgo: number
  updatedAtDaysAgo: number
  themeId?: string
  variables?: DocVariable[]
  pages: DocPage[]
}

function template(options: TemplateOptions): LibraryDocument {
  const doc: DocDocument = {
    id: options.id,
    name: options.name,
    description: options.description,
    category: options.category,
    type: options.type,
    status: "published",
    author: options.author,
    version: options.version,
    createdAt: nowIso(options.createdAtDaysAgo),
    updatedAt: nowIso(options.updatedAtDaysAgo),
    mode: "freeform",
    theme: themePresetById(options.themeId ?? "corporate") ?? {
      headingFont: "Geist Variable",
      bodyFont: "Geist Variable",
      codeFont: "ui-monospace, monospace",
      primary: "#495464",
      secondary: "#bbbfca",
      accent: "#3b82f6",
      background: "#ffffff",
      text: "#1f2937",
      border: "#d1d5db",
      pageMargin: 56,
      sectionSpacing: 24,
      paragraphSpacing: 12,
      componentSpacing: 16,
      companyName: "Swiftant",
      footerText: "Confidential",
    },
    variables: options.variables ?? [],
    pages: options.pages,
    grid: 8,
    snapToGrid: true,
  }
  return { ...doc, versions: [] }
}

const vars = (pairs: [string, string][]): DocVariable[] =>
  pairs.map(([name, value]) => ({ name, value }))

export function seededLibraryTemplates(): LibraryDocument[] {
  return [
    template({
      id: "TPL-VAPT-001",
      name: "VAPT Security Assessment",
      description:
        "Full penetration test report with executive summary, risk chart, structured findings, test cases and API evidence.",
      category: "vapt",
      type: "vapt",
      author: "Security Team",
      version: "2.1",
      createdAtDaysAgo: 12,
      updatedAtDaysAgo: 0,
      themeId: "security",
      variables: vars([
        ["client_name", "Acme Corporation"],
        ["project_name", "External Network & Web Pentest 2026"],
        ["report_date", "2026-08-10"],
        ["author", "Srikanth Sankar"],
        ["company_name", "Swiftant"],
        ["vulnerability_count", "18"],
      ]),
      pages: [
        page("a4", "portrait", "Cover", [
          createElement("header", 72, 48, 650, 48, {
            props: { company: "{{company_name}}", title: "Red Team" },
          }),
          createElement("heading", 72, 180, 650, 96, {
            props: {
              level: "h1",
              content: "VAPT SECURITY ASSESSMENT",
              align: "left",
              letterSpacing: 1,
            },
          }),
          createElement("divider", 72, 300, 650, 24, {
            props: { color: "#dc2626", thickness: 3 },
          }),
          createElement("text", 72, 350, 420, 160, {
            props: {
              content:
                "Client: {{client_name}}\nProject: {{project_name}}\nAssessment date: {{report_date}}\n\nPrepared by:\n{{author}}",
              fontSize: 14,
              lineHeight: 1.8,
            },
          }),
          createElement("text", 72, 560, 420, 40, {
            props: {
              content: "Risk summary",
              variant: "label",
              fontWeight: "600",
            },
          }),
          createElement("severityBadge", 72, 600, 120, 32, {
            props: { severity: "critical", label: "2 Critical" },
          }),
          createElement("severityBadge", 210, 600, 120, 32, {
            props: { severity: "high", label: "5 High" },
          }),
          createElement("severityBadge", 348, 600, 120, 32, {
            props: { severity: "medium", label: "8 Medium" },
          }),
          createElement("severityBadge", 486, 600, 120, 32, {
            props: { severity: "low", label: "3 Low" },
          }),
          createElement("footer", 72, 1020, 650, 40, {
            props: { left: "Confidential — {{company_name}}", pageNumber: true, right: "v{{version}}" },
          }),
        ]),
        page("a4", "portrait", "Executive Summary", [
          createElement("heading", 72, 56, 650, 40, {
            props: { level: "h2", content: "Executive Summary" },
          }),
          createElement("text", 72, 120, 650, 200, {
            props: {
              content:
                "Between {{report_date}}, Swiftant performed an external penetration test against {{client_name}}. A total of {{vulnerability_count}} findings were identified: 2 critical, 5 high, 8 medium and 3 low.\n\nThe most significant exposures were found in the authentication layer of the public web application. Detailed findings and remediation guidance are provided on the following pages.",
              lineHeight: 1.7,
            },
          }),
          createElement("heading", 72, 360, 650, 36, {
            props: { level: "h3", content: "Risk Summary" },
          }),
          createElement("chart", 72, 420, 480, 260, {
            props: {
              title: "Findings by severity",
              data: "Critical 2\nHigh 5\nMedium 8\nLow 3",
              color: "",
              showValues: true,
            },
          }),
          createElement("callout", 72, 720, 650, 110, {
            props: {
              variant: "warning",
              title: "Immediate action required",
              content:
                "Critical and high severity findings should be remediated within 7 and 14 days respectively.",
            },
          }),
        ]),
        page("a4", "portrait", "Findings & Test Cases", [
          createElement("heading", 72, 48, 650, 36, {
            props: { level: "h3", content: "Finding #1 — Broken Authentication" },
          }),
          createElement("finding", 72, 96, 650, 420, {
            props: {
              title: "Missing rate limiting on login endpoint",
              severity: "high",
              cvss: "8.1",
              status: "Open",
              affected: "https://app.example.com/api/v1/login",
              description:
                "The login endpoint accepts unlimited authentication attempts without rate limiting or account lockout, enabling credential brute force.",
              impact:
                "An attacker can brute force credentials and gain unauthorized access to user accounts.",
              evidence:
                "POST /api/v1/login was called 10,000 times in 90 seconds with 200 responses. See evidence block.",
              recommendation:
                "Implement rate limiting (e.g. 5 attempts per minute), account lockout and multi-factor authentication.",
            },
          }),
          createElement("evidence", 72, 540, 650, 160, {
            props: {
              kind: "request",
              label: "Evidence",
              content:
                "POST /api/v1/login HTTP/1.1\nHost: app.example.com\nContent-Type: application/json\n\n{\"username\":\"admin\",\"password\":\"guess\"}",
            },
          }),
          createElement("apiRequest", 72, 720, 650, 240, {
            props: {
              method: "POST",
              url: "https://app.example.com/api/v1/login",
              headers: "Host: app.example.com\nContent-Type: application/json",
              body: "{\n  \"username\": \"admin\",\n  \"password\": \"guess\"\n}",
              responseStatus: "200 OK",
              responseBody: "{\n  \"token\": \"<session token>\",\n  \"role\": \"admin\"\n}",
            },
          }),
        ]),
        page("a4", "portrait", "Test Cases", [
          createElement("heading", 72, 48, 650, 36, {
            props: { level: "h3", content: "Authentication Test Cases" },
          }),
          createElement("testCaseTable", 72, 104, 650, 260, {
            props: {
              rows: [
                ["TC-01", "Login with valid credentials", "200 + session token", "200 + session token", "Pass", "Evidence #1", ""],
                ["TC-02", "Login with wrong password", "401 Unauthorized", "401 Unauthorized", "Pass", "", ""],
                ["TC-03", "Brute force protection", "Rate limited after 5 attempts", "No limit applied", "Fail", "Evidence #2", "High severity"],
                ["TC-04", "Account lockout policy", "Locked after 10 attempts", "No lockout", "Fail", "", "High severity"],
                ["TC-05", "Session fixation", "New session id issued", "Verified", "Pass", "", ""],
              ],
              headerRow: true,
              fontSize: 12,
            },
          }),
          createElement("footer", 72, 1020, 650, 40, {
            props: { left: "Confidential — {{company_name}}", pageNumber: true },
          }),
        ]),
      ],
    }),
    template({
      id: "TPL-STUDY-001",
      name: "Cybersecurity Study Notes",
      description:
        "Structured study material with definitions, examples, callouts, questions and checklists.",
      category: "study",
      type: "study",
      author: "Training",
      version: "1.4",
      createdAtDaysAgo: 20,
      updatedAtDaysAgo: 1,
      themeId: "education",
      variables: vars([
        ["course_name", "Cybersecurity Fundamentals"],
        ["chapter", "Networking & Authentication"],
        ["author", "Instructor"],
      ]),
      pages: [
        page("a4", "portrait", "Chapter 1", [
          createElement("heading", 72, 56, 650, 60, {
            props: {
              level: "h1",
              content: "Chapter 1 — {{chapter}}",
            },
          }),
          createElement("eduBox", 72, 140, 650, 120, {
            props: {
              variant: "definition",
              title: "Authentication",
              content:
                "Authentication verifies who the user is. It answers the question: are you who you claim to be?",
            },
          }),
          createElement("eduBox", 72, 280, 650, 150, {
            props: {
              variant: "example",
              title: "Example",
              content:
                "Logging in with a username and password is authentication. Multi-factor authentication adds a second proof such as a one-time code.",
            },
          }),
          createElement("callout", 72, 450, 650, 110, {
            props: {
              variant: "tip",
              title: "Exam tip",
              content: "Remember: Authentication = identity. Authorization = access to resources.",
            },
          }),
          createElement("checklist", 72, 580, 650, 200, {
            props: {
              title: "Checklist",
              items: "[x] Read chapter overview\n[x] Review key terms\n[ ] Complete practice questions\n[ ] Take the quiz",
            },
          }),
          createElement("footer", 72, 1020, 650, 40, {
            props: { left: "{{course_name}}", center: "", right: "Page {n} of {m}", pageNumber: false },
          }),
        ]),
        page("a4", "portrait", "Chapter 2", [
          createElement("heading", 72, 56, 650, 44, {
            props: { level: "h2", content: "Practice Questions" },
          }),
          createElement("eduBox", 72, 120, 650, 130, {
            props: {
              variant: "question",
              title: "Question 1",
              content: "What is the difference between authentication and authorization?",
            },
          }),
          createElement("eduBox", 72, 270, 650, 130, {
            props: {
              variant: "answer",
              title: "Answer",
              content: "Authentication confirms identity; authorization determines what an authenticated identity is allowed to do.",
            },
          }),
          createElement("eduBox", 72, 420, 650, 110, {
            props: {
              variant: "takeaway",
              title: "Key takeaway",
              content: "Never rely on authentication alone. Combine it with authorization, auditing and least privilege.",
            },
          }),
          createElement("code", 72, 550, 650, 180, {
            props: {
              language: "bash",
              code: "openssl s_client -connect example.com:443 -servername example.com\n# Inspect the certificate chain and handshake",
            },
          }),
          createElement("callout", 72, 750, 650, 100, {
            props: {
              variant: "warning",
              title: "Common pitfall",
              content: "Storing passwords in plain text is never acceptable. Always use a strong one-way hash with salts.",
            },
          }),
        ]),
      ],
    }),
    template({
      id: "TPL-RESUME-001",
      name: "Modern Resume",
      description:
        "Clean single-page resume with contact header, experience, skills and education sections.",
      category: "resume",
      type: "resume",
      author: "Design",
      version: "1.0",
      createdAtDaysAgo: 30,
      updatedAtDaysAgo: 2,
      themeId: "modern",
      variables: vars([
        ["name", "Alex Morgan"],
        ["role", "Senior Product Designer"],
        ["email", "alex.morgan@example.com"],
      ]),
      pages: [
        page("a4", "portrait", "Resume", [
          createElement("heading", 60, 56, 400, 52, {
            props: { level: "h1", content: "{{name}}", fontSize: 34 },
          }),
          createElement("text", 60, 112, 400, 26, {
            props: {
              content: "{{role}}",
              fontSize: 17,
              color: "#6b7280",
              fontWeight: "500",
            },
          }),
          createElement("text", 60, 146, 400, 54, {
            props: {
              content: "{{email}}\n+1 (555) 123-4567\nPortfolio: alexmorgan.dev",
              fontSize: 12.5,
              lineHeight: 1.6,
              color: "#4b5563",
            },
          }),
          createElement("divider", 60, 216, 674, 24, { props: { color: "#e5e7eb" } }),
          createElement("heading", 60, 256, 200, 30, {
            props: { level: "h3", content: "EXPERIENCE" },
          }),
          createElement("text", 60, 296, 674, 110, {
            props: {
              content:
                "Senior Product Designer — Acme Studio\n2021 – Present\n\nLed end-to-end design for a B2B analytics platform, growing activation by 34% and shipping 4 major releases per year.",
              fontSize: 13.5,
              lineHeight: 1.65,
            },
          }),
          createElement("text", 60, 410, 674, 100, {
            props: {
              content:
                "Product Designer — Northwind Labs\n2018 – 2021\n\nDesigned mobile-first onboarding and design systems used across 12 products.",
              fontSize: 13.5,
              lineHeight: 1.65,
            },
          }),
          createElement("heading", 60, 526, 200, 30, {
            props: { level: "h3", content: "SKILLS" },
          }),
          createElement("list", 60, 566, 674, 110, {
            props: {
              kind: "bullet",
              items: "Product strategy & discovery\nDesign systems (Figma, Tokens Studio)\nPrototyping & usability testing\nHTML, CSS and React basics",
              spacing: 5,
            },
          }),
          createElement("heading", 60, 692, 200, 30, {
            props: { level: "h3", content: "EDUCATION" },
          }),
          createElement("text", 60, 732, 674, 80, {
            props: {
              content:
                "B.Sc. Interaction Design — University of Design, 2018\nAwards: Dean's list, Best Capstone Project",
              fontSize: 13.5,
              lineHeight: 1.65,
            },
          }),
          createElement("footer", 60, 1020, 674, 40, {
            props: { left: "{{name}}", center: "", right: "{{email}}", pageNumber: false },
          }),
        ]),
      ],
    }),
    template({
      id: "TPL-INV-001",
      name: "Service Invoice",
      description:
        "Professional invoice with line items, totals and payment details.",
      category: "invoices",
      type: "invoice",
      author: "Finance",
      version: "1.2",
      createdAtDaysAgo: 8,
      updatedAtDaysAgo: 3,
      themeId: "business",
      variables: vars([
        ["invoice_number", "INV-2026-0412"],
        ["client_name", "Acme Corporation"],
        ["issue_date", "2026-08-12"],
        ["due_date", "2026-09-12"],
        ["total_amount", "$4,200.00"],
        ["company_name", "Swiftant"],
      ]),
      pages: [
        page("a4", "portrait", "Invoice", [
          createElement("header", 72, 48, 650, 56, {
            props: { company: "{{company_name}}", title: "INVOICE" },
          }),
          createElement("text", 72, 140, 300, 90, {
            props: {
              content:
                "Invoice: {{invoice_number}}\nIssue date: {{issue_date}}\nDue date: {{due_date}}\nBill to: {{client_name}}",
              fontSize: 13,
              lineHeight: 1.8,
            },
          }),
          createElement("table", 72, 280, 650, 220, {
            props: {
              preset: "invoice",
              rows: [
                ["Description", "Qty", "Rate", "Amount"],
                ["Vulnerability assessment", "1", "$2,400.00", "$2,400.00"],
                ["Remediation verification", "2", "$700.00", "$1,400.00"],
                ["Reporting", "1", "$400.00", "$400.00"],
              ],
              headerRow: true,
              headerBg: "#065f46",
              headerColor: "#ffffff",
              alternating: true,
            },
          }),
          createElement("text", 500, 540, 220, 30, {
            props: {
              content: "TOTAL   {{total_amount}}",
              fontSize: 15,
              fontWeight: "700",
              align: "right",
            },
          }),
          createElement("divider", 72, 640, 650, 24, { props: {} }),
          createElement("callout", 72, 680, 650, 110, {
            props: {
              variant: "info",
              title: "Payment details",
              content:
                "Please transfer to the bank account listed on the attached payment terms. Late payments are subject to a 1.5% monthly fee.",
            },
          }),
          createElement("footer", 72, 1020, 650, 40, {
            props: { left: "{{company_name}}", center: "Thank you!", right: "Invoice {{invoice_number}}" },
          }),
        ]),
      ],
    }),
    template({
      id: "TPL-PROP-001",
      name: "Project Proposal",
      description:
        "Persuasive proposal with scope, deliverables, timeline and pricing.",
      category: "proposals",
      type: "proposal",
      author: "Sales",
      version: "1.0",
      createdAtDaysAgo: 5,
      updatedAtDaysAgo: 4,
      themeId: "corporate",
      variables: vars([
        ["client_name", "Acme Corporation"],
        ["project_name", "Security Hardening Program"],
        ["total_price", "$18,000"],
        ["timeline", "6 weeks"],
        ["company_name", "Swiftant"],
      ]),
      pages: [
        page("a4", "portrait", "Proposal", [
          createElement("header", 72, 48, 650, 56, {
            props: { company: "{{company_name}}", title: "Proposal" },
          }),
          createElement("heading", 72, 160, 650, 60, {
            props: { level: "h1", content: "{{project_name}}" },
          }),
          createElement("text", 72, 236, 650, 90, {
            props: {
              content:
                "Prepared for {{client_name}}\n\nThank you for the opportunity to support your security objectives. This proposal outlines the scope, deliverables and commercial terms for the {{project_name}}.",
              fontSize: 14,
              lineHeight: 1.7,
            },
          }),
          createElement("heading", 72, 360, 650, 32, {
            props: { level: "h3", content: "Scope" },
          }),
          createElement("list", 72, 404, 650, 120, {
            props: {
              kind: "bullet",
              items: "External & internal network assessment\nWeb application penetration testing\nSocial engineering simulation\nRemediation support workshop",
              spacing: 6,
            },
          }),
          createElement("heading", 72, 556, 650, 32, {
            props: { level: "h3", content: "Commercials" },
          }),
          createElement("table", 72, 600, 650, 140, {
            props: {
              rows: [
                ["Deliverable", "Timeline", "Price"],
                ["Full assessment", "{{timeline}}", "{{total_price}}"],
              ],
              headerRow: true,
              headerBg: "#1e3a5f",
              headerColor: "#ffffff",
            },
          }),
          createElement("callout", 72, 776, 650, 110, {
            props: {
              variant: "success",
              title: "Next steps",
              content:
                "We are happy to schedule a kick-off within one week of approval. This proposal is valid for 30 days.",
            },
          }),
        ]),
      ],
    }),
  ]
}

export const seedTemplateIds = ["TPL-VAPT-001", "TPL-STUDY-001", "TPL-RESUME-001", "TPL-INV-001", "TPL-PROP-001"]
