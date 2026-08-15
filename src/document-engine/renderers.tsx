import type { CSSProperties, ReactNode } from "react"

import type { DocElement, RenderContext } from "@/document-engine/types"
import { resolveText } from "@/document-engine/variables"

type Props = Record<string, unknown>
type RenderFn = (props: Props, ctx: RenderContext) => ReactNode

function S(props: Props, key: string, fallback = ""): string {
  return typeof props[key] === "string" ? (props[key] as string) : fallback
}
function N(props: Props, key: string, fallback = 0): number {
  return typeof props[key] === "number" ? (props[key] as number) : fallback
}
function B(props: Props, key: string, fallback = false): boolean {
  return typeof props[key] === "boolean" ? (props[key] as boolean) : fallback
}

const fullBox: CSSProperties = {
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
  overflow: "hidden",
}

const resolve = (text: string, ctx: RenderContext) =>
  resolveText(text, ctx.variables)

function renderText(props: Props, ctx: RenderContext): ReactNode {
  const variant = S(props, "variant", "paragraph")
  const content = resolve(S(props, "content", ""), ctx)
  const style: CSSProperties = {
    ...fullBox,
    fontFamily: S(props, "fontFamily") || ctx.theme.bodyFont,
    fontSize: N(props, "fontSize") || 14,
    fontWeight: S(props, "fontWeight", "400"),
    fontStyle: B(props, "italic") ? "italic" : "normal",
    textDecoration: B(props, "underline") ? "underline" : "none",
    color: S(props, "color") || ctx.theme.text,
    backgroundColor: S(props, "background") || "transparent",
    textAlign: S(props, "align", "left") as CSSProperties["textAlign"],
    lineHeight: N(props, "lineHeight", 1.6),
    letterSpacing: N(props, "letterSpacing", 0),
    padding: N(props, "padding", 0),
    borderRadius: N(props, "radius", 0),
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  }
  const baseFontSize = N(props, "fontSize") || 14
  if (variant === "caption") {
    style.fontSize = baseFontSize > 13 ? baseFontSize : 12
    style.opacity = 0.7
  }
  if (variant === "label") {
    style.fontWeight = "600"
    style.fontSize = baseFontSize > 12 ? baseFontSize : 11
    style.letterSpacing = 0.4
  }
  if (variant === "quote") {
    style.fontStyle = "italic"
    style.borderLeft = `3px solid ${ctx.theme.accent}`
    style.paddingLeft = 12
  }
  return <div style={style}>{content}</div>
}

function renderHeading(props: Props, ctx: RenderContext): ReactNode {
  const level = S(props, "level", "h1")
  const sizes: Record<string, number> = { h1: 32, h2: 24, h3: 20 }
  const content = resolve(S(props, "content", ""), ctx)
  const transform = S(props, "textTransform", "none")
  const style: CSSProperties = {
    ...fullBox,
    fontFamily: S(props, "fontFamily") || ctx.theme.headingFont,
    fontSize: N(props, "fontSize") || sizes[level] || 24,
    fontWeight: S(props, "fontWeight", "700"),
    color: S(props, "color") || ctx.theme.primary,
    textAlign: S(props, "align", "left") as CSSProperties["textAlign"],
    letterSpacing: N(props, "letterSpacing", 0),
    lineHeight: N(props, "lineHeight", 1.2),
    textTransform:
      transform === "uppercase"
        ? "uppercase"
        : transform === "capitalize"
          ? "capitalize"
          : "none",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  }
  return <div style={style}>{content}</div>
}

function renderImage(props: Props, _ctx: RenderContext): ReactNode {
  const src = S(props, "src")
  const fit = S(props, "fit", "cover")
  const style: CSSProperties = {
    ...fullBox,
    borderRadius: N(props, "radius", 0),
    border: `${N(props, "borderWidth", 0)}px solid ${S(props, "borderColor") || "transparent"}`,
    backgroundColor: S(props, "bg", "#e5e7eb"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  }
  if (!src) {
    return (
      <div style={style}>
        <svg
          fill="none"
          height="32"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="32"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    )
  }
  return (
    <div style={style}>
      <img
        src={src}
        alt={S(props, "caption")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: fit as CSSProperties["objectFit"],
          borderRadius: N(props, "radius", 0),
          display: "block",
        }}
      />
    </div>
  )
}

function renderShape(props: Props, _ctx: RenderContext): ReactNode {
  const kind = S(props, "shape", "rect")
  const fill = S(props, "fill", "#e5e7eb")
  const stroke = S(props, "stroke", "#495464")
  const strokeWidth = N(props, "strokeWidth", 1)
  const fillOpacity = N(props, "fillOpacity", 1)
  const radius = N(props, "radius", 8)

  if (kind === "line" || kind === "arrow") {
    const head = kind === "arrow"
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line
          x1="0"
          y1="50"
          x2={head ? "92" : "100"}
          y2="50"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {head && (
          <polygon points="92,38 100,50 92,62" fill={stroke} />
        )}
      </svg>
    )
  }
  const style: CSSProperties = {
    width: "100%",
    height: "100%",
    backgroundColor: fill,
    border: `${strokeWidth}px solid ${stroke}`,
    borderRadius: kind === "circle" ? "50%" : radius,
    opacity: fillOpacity,
  }
  return <div style={style} />
}

function renderDivider(props: Props, _ctx: RenderContext): ReactNode {
  const orientation = S(props, "orientation", "horizontal")
  const thickness = N(props, "thickness", 2)
  const style = S(props, "style", "solid")
  const color = S(props, "color", "#d1d5db")
  const widthPercent = N(props, "widthPercent", 100)

  if (orientation === "vertical") {
    return (
      <div
        style={{
          ...fullBox,
          borderLeft: `${thickness}px ${style} ${color}`,
        }}
      />
    )
  }
  return (
    <div
      style={{
        width: `${widthPercent}%`,
        margin: "auto",
        borderTop: `${thickness}px ${style} ${color}`,
      }}
    />
  )
}

function renderContainer(props: Props, ctx: RenderContext): ReactNode {
  const content = resolve(S(props, "content", ""), ctx)
  const shadows: Record<string, string> = {
    sm: "0 1px 2px rgba(0,0,0,0.08)",
    md: "0 4px 12px rgba(0,0,0,0.1)",
    lg: "0 12px 32px rgba(0,0,0,0.16)",
  }
  const shadow = S(props, "shadow", "none")
  const style: CSSProperties = {
    ...fullBox,
    backgroundColor: S(props, "background") || "transparent",
    border: `${N(props, "borderWidth", 0)}px solid ${S(props, "borderColor") || "transparent"}`,
    borderRadius: N(props, "radius", 8),
    padding: N(props, "padding", 16),
    boxShadow: shadows[shadow] ?? "none",
    fontFamily: ctx.theme.bodyFont,
    fontSize: 14,
    color: ctx.theme.text,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    textAlign: S(props, "align", "left") as CSSProperties["textAlign"],
  }
  return <div style={style}>{content}</div>
}

function renderHeader(props: Props, ctx: RenderContext): ReactNode {
  const company = resolve(S(props, "company") || ctx.theme.companyName, ctx)
  const title = resolve(S(props, "title", ""), ctx)
  const align = S(props, "align", "left")
  const style: CSSProperties = {
    ...fullBox,
    display: "flex",
    alignItems: "center",
    gap: 16,
    backgroundColor: S(props, "background") || "transparent",
    borderBottom: B(props, "showDivider", true)
      ? `1px solid ${ctx.theme.border}`
      : "none",
    justifyContent:
      align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
  }
  const textStyle: CSSProperties = {
    fontFamily: ctx.theme.headingFont,
    fontSize: N(props, "fontSize", 14),
    fontWeight: S(props, "fontWeight", "600"),
    color: S(props, "color") || ctx.theme.primary,
    whiteSpace: "nowrap",
  }
  return (
    <div style={style}>
      <span style={textStyle}>{company}</span>
      {title && (
        <span style={{ ...textStyle, color: ctx.theme.text, fontWeight: "400", opacity: 0.8 }}>
          {title}
        </span>
      )}
    </div>
  )
}

function renderFooter(props: Props, ctx: RenderContext): ReactNode {
  const left = resolve(S(props, "left", ""), ctx)
  const center = resolve(S(props, "center", ""), ctx)
  const right = resolve(S(props, "right", ""), ctx)
  const pageNumber = B(props, "pageNumber", true)
  const style: CSSProperties = {
    ...fullBox,
    display: "flex",
    alignItems: "center",
    gap: 12,
    backgroundColor: S(props, "background") || "transparent",
    borderTop: B(props, "showDivider", true)
      ? `1px solid ${ctx.theme.border}`
      : "none",
    color: S(props, "color") || ctx.theme.text,
    fontSize: N(props, "fontSize", 12),
    fontFamily: ctx.theme.bodyFont,
  }
  const zone: CSSProperties = { flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
  return (
    <div style={style}>
      <span style={zone}>{left}</span>
      <span style={{ ...zone, textAlign: "center" }}>
        {center ||
          (pageNumber
            ? `Page ${ctx.pageIndex + 1} of ${ctx.totalPages}`
            : "")}
      </span>
      <span style={{ ...zone, textAlign: "right" }}>{right}</span>
    </div>
  )
}

function renderPageNumber(props: Props, ctx: RenderContext): ReactNode {
  const format = S(props, "format", "Page {n} of {m}")
  const text = format
    .replace(/\{n\}/g, String(ctx.pageIndex + 1))
    .replace(/\{m\}/g, String(ctx.totalPages))
  return (
    <div
      style={{
        ...fullBox,
        display: "flex",
        alignItems: "center",
        justifyContent:
          S(props, "align", "center") === "left"
            ? "flex-start"
            : S(props, "align") === "right"
              ? "flex-end"
              : "center",
        fontFamily: ctx.theme.bodyFont,
        fontSize: N(props, "fontSize", 12),
        color: S(props, "color") || ctx.theme.text,
      }}
    >
      {text}
    </div>
  )
}

function renderTable(props: Props, _ctx: RenderContext): ReactNode {
  const rows = Array.isArray(props.rows) ? (props.rows as string[][]) : []
  const colWidths = Array.isArray(props.colWidths)
    ? (props.colWidths as number[])
    : []
  const colCount = rows.reduce((max, row) => Math.max(max, row.length), 0)
  const headerRow = B(props, "headerRow", true)
  const alternating = B(props, "alternating", true)
  const borderColor = S(props, "borderColor", "#d1d5db")
  const borderWidth = N(props, "borderWidth", 1)
  const cellPadding = N(props, "cellPadding", 6)
  const align = S(props, "align", "left") as CSSProperties["textAlign"]
  const headerBg = S(props, "headerBg", "#f3f4f6")
  const headerColor = S(props, "headerColor", "#111827")
  const cellBg = S(props, "cellBg", "#ffffff")
  const fontSize = N(props, "fontSize", 13)
  const border = `${borderWidth}px solid ${borderColor}`

  const renderRow = (cells: string[], rowIndex: number, isHeader: boolean) => {
    const cellStyle: CSSProperties = {
      border,
      padding: cellPadding,
      textAlign: align,
      fontSize,
      fontFamily: "inherit",
      wordBreak: "break-word",
      verticalAlign: "top",
    }
    if (isHeader) {
      cellStyle.backgroundColor = headerBg
      cellStyle.color = headerColor
      cellStyle.fontWeight = "600"
    } else {
      cellStyle.backgroundColor =
        alternating && rowIndex % 2 === 1 ? "#f9fafb" : cellBg
    }
    return Array.from({ length: colCount }).map((_, i) => (
      <td
        key={i}
        style={{
          ...cellStyle,
          width: colWidths[i] ? `${colWidths[i]}%` : undefined,
        }}
      >
        {cells[i] ?? ""}
      </td>
    ))
  }

  const body = headerRow ? rows.slice(1) : rows
  return (
    <table
      style={{
        ...fullBox,
        width: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed",
        fontFamily: "inherit",
      }}
    >
      {headerRow && rows.length > 0 && (
        <thead>
          <tr>{renderRow(rows[0], 0, true)}</tr>
        </thead>
      )}
      <tbody>
        {body.map((row, index) => (
          <tr key={index}>{renderRow(row, index, false)}</tr>
        ))}
      </tbody>
    </table>
  )
}

function renderCode(props: Props, ctx: RenderContext): ReactNode {
  const language = S(props, "language", "text")
  const code = S(props, "code", "")
  return (
    <div
      style={{
        ...fullBox,
        backgroundColor: "#1e293b",
        color: "#e2e8f0",
        fontFamily: ctx.theme.codeFont,
        fontSize: 12,
        borderRadius: 8,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {B(props, "showLabel", true) && (
        <div
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: "#94a3b8",
          }}
        >
          {language}
        </div>
      )}
      <pre
        style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflow: "hidden",
          flex: 1,
        }}
      >
        {code}
      </pre>
    </div>
  )
}

const CALLOUT_META: Record<
  string,
  { bg: string; border: string; color: string; glyph: string }
> = {
  info: { bg: "#eff6ff", border: "#93c5fd", color: "#1e3a8a", glyph: "i" },
  success: { bg: "#ecfdf5", border: "#6ee7b7", color: "#065f46", glyph: "✓" },
  warning: { bg: "#fffbeb", border: "#fcd34d", color: "#92400e", glyph: "⚠" },
  error: { bg: "#fef2f2", border: "#fca5a5", color: "#991b1b", glyph: "✕" },
  tip: { bg: "#faf5ff", border: "#d8b4fe", color: "#6b21a8", glyph: "✦" },
  quote: { bg: "#f8fafc", border: "#cbd5e1", color: "#334155", glyph: "“" },
}

function renderCallout(props: Props, ctx: RenderContext): ReactNode {
  const variant = S(props, "variant", "info")
  const meta = CALLOUT_META[variant] ?? CALLOUT_META.info
  const title = resolve(S(props, "title", ""), ctx)
  const content = resolve(S(props, "content", ""), ctx)
  return (
    <div
      style={{
        ...fullBox,
        display: "flex",
        gap: 12,
        backgroundColor: meta.bg,
        border: `1px solid ${meta.border}`,
        borderLeft: `4px solid ${meta.color}`,
        borderRadius: 8,
        padding: 12,
        color: meta.color,
        fontFamily: ctx.theme.bodyFont,
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          flexShrink: 0,
          borderRadius: "50%",
          backgroundColor: meta.color,
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        {meta.glyph}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>
        )}
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {content}
        </div>
      </div>
    </div>
  )
}

function renderList(props: Props, ctx: RenderContext): ReactNode {
  const kind = S(props, "kind", "bullet")
  const items = S(props, "items", "")
    .split("\n")
    .filter((line) => line.trim() !== "")
  const spacing = N(props, "spacing", 6)
  const ListTag = kind === "numbered" ? "ol" : "ul"
  return (
    <div style={{ ...fullBox, overflowY: "auto" }}>
      <ListTag
        style={{
          margin: 0,
          paddingLeft: 20,
          fontFamily: ctx.theme.bodyFont,
          fontSize: 14,
          color: ctx.theme.text,
          lineHeight: 1.6,
          display: "flex",
          flexDirection: "column",
          gap: spacing,
        }}
      >
        {items.map((item, index) => (
          <li key={index}>{resolve(item, ctx)}</li>
        ))}
      </ListTag>
    </div>
  )
}

function renderChecklist(props: Props, ctx: RenderContext): ReactNode {
  const title = resolve(S(props, "title", ""), ctx)
  const lines = S(props, "items", "")
    .split("\n")
    .filter((line) => line.trim() !== "")
  const entries = lines.map((line) => {
    const trimmed = line.trim()
    const checked =
      trimmed.startsWith("[x]") || trimmed.startsWith("[X]") || trimmed.startsWith("☑")
    const cleaned = trimmed.replace(/^\[[ xX]\]\s*/, "").replace(/^[☑☐]\s*/, "")
    return { checked, label: resolve(cleaned, ctx) }
  })
  return (
    <div
      style={{
        ...fullBox,
        fontFamily: ctx.theme.bodyFont,
        fontSize: 14,
        color: ctx.theme.text,
        lineHeight: 1.6,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {title && (
        <div style={{ fontWeight: 700, marginBottom: 2 }}>{title}</div>
      )}
      {entries.map((entry, index) => (
        <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span
            style={{
              width: 14,
              height: 14,
              marginTop: 3,
              flexShrink: 0,
              border: `1.5px solid ${ctx.theme.primary}`,
              borderRadius: 3,
              backgroundColor: entry.checked ? ctx.theme.primary : "transparent",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {entry.checked ? "✓" : ""}
          </span>
          <span style={{ flex: 1, wordBreak: "break-word", textDecoration: entry.checked ? "line-through" : "none", opacity: entry.checked ? 0.6 : 1 }}>
            {entry.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function renderLink(props: Props, ctx: RenderContext): ReactNode {
  const text = resolve(S(props, "text", ""), ctx)
  const href = resolve(S(props, "href", ""), ctx)
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        ...fullBox,
        display: "inline-flex",
        alignItems: "center",
        color: S(props, "color", "#2563eb"),
        fontFamily: ctx.theme.bodyFont,
        fontSize: N(props, "fontSize", 14),
        fontWeight: S(props, "weight", "500"),
        textDecoration: B(props, "underline", true) ? "underline" : "none",
        wordBreak: "break-word",
      }}
    >
      {text}
    </a>
  )
}

const SEVERITY_META: Record<
  string,
  { bg: string; color: string; dot: string }
> = {
  critical: { bg: "#fee2e2", color: "#b91c1c", dot: "#dc2626" },
  high: { bg: "#ffedd5", color: "#c2410c", dot: "#ea580c" },
  medium: { bg: "#fef3c7", color: "#b45309", dot: "#d97706" },
  low: { bg: "#dbeafe", color: "#1d4ed8", dot: "#2563eb" },
  informational: { bg: "#f3f4f6", color: "#4b5563", dot: "#6b7280" },
}

function severityLabel(severity: string): string {
  const labels: Record<string, string> = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    informational: "Informational",
  }
  return labels[severity] ?? severity
}

function renderSeverityBadge(props: Props, _ctx: RenderContext): ReactNode {
  const severity = S(props, "severity", "medium")
  const meta = SEVERITY_META[severity] ?? SEVERITY_META.medium
  const label = S(props, "label") || severityLabel(severity)
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        backgroundColor: meta.bg,
        color: meta.color,
        borderRadius: 999,
        padding: "4px 12px",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "inherit",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: meta.dot,
          flexShrink: 0,
        }}
      />
      {label}
    </div>
  )
}

const META_LABELS = [
  { key: "affected", label: "Affected" },
  { key: "cvss", label: "CVSS" },
  { key: "status", label: "Status" },
] as const

function renderFinding(props: Props, ctx: RenderContext): ReactNode {
  const title = resolve(S(props, "title", ""), ctx)
  const severity = S(props, "severity", "medium")
  const meta = SEVERITY_META[severity] ?? SEVERITY_META.medium
  const sections = [
    { label: "Description", value: S(props, "description") },
    { label: "Impact", value: S(props, "impact") },
    { label: "Evidence", value: S(props, "evidence") },
    { label: "Recommendation", value: S(props, "recommendation") },
    { label: "References", value: S(props, "references") },
  ].filter((section) => section.value.trim() !== "")
  return (
    <div
      style={{
        ...fullBox,
        overflowY: "auto",
        fontFamily: ctx.theme.bodyFont,
        border: `1px solid ${ctx.theme.border}`,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: ctx.theme.text, flex: 1, minWidth: 160 }}>
          {title}
        </span>
        <span
          style={{
            backgroundColor: meta.bg,
            color: meta.color,
            borderRadius: 999,
            padding: "2px 10px",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {severityLabel(severity)}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          backgroundColor: "#f8fafc",
          border: `1px solid ${ctx.theme.border}`,
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 12,
        }}
      >
        {META_LABELS.map((item) => (
          <span key={item.key} style={{ color: ctx.theme.text }}>
            <b>{item.label}:</b>{" "}
            <span style={{ opacity: 0.85 }}>{S(props, item.key)}</span>
          </span>
        ))}
      </div>
      {sections.map((section) => (
        <div key={section.label}>
          <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: ctx.theme.primary, marginBottom: 3 }}>
            {section.label}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word", color: ctx.theme.text }}>
            {resolve(section.value, ctx)}
          </div>
        </div>
      ))}
    </div>
  )
}

const EVIDENCE_META: Record<string, { bg: string; border: string; color: string }> = {
  screenshot: { bg: "#f8fafc", border: "#cbd5e1", color: "#475569" },
  request: { bg: "#f0f9ff", border: "#7dd3fc", color: "#075985" },
  response: { bg: "#ecfdf5", border: "#6ee7b7", color: "#065f46" },
  code: { bg: "#f8fafc", border: "#cbd5e1", color: "#1e293b" },
  command: { bg: "#f5f3ff", border: "#c4b5fd", color: "#4c1d95" },
}

function renderEvidence(props: Props, ctx: RenderContext): ReactNode {
  const kind = S(props, "kind", "code")
  const label = resolve(S(props, "label", "Evidence"), ctx)
  const content = S(props, "content", "")
  const meta = EVIDENCE_META[kind] ?? EVIDENCE_META.code
  if (kind === "screenshot") {
    return (
      <div
        style={{
          ...fullBox,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          border: `1.5px dashed ${meta.border}`,
          borderRadius: 8,
          backgroundColor: meta.bg,
          color: meta.color,
          padding: 12,
          fontFamily: ctx.theme.bodyFont,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6 }}>
          {label}
        </span>
        <div style={{ flex: 1, fontSize: 12, whiteSpace: "pre-wrap", wordBreak: "break-word", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.8 }}>
          {content || "Add screenshot evidence (paste into the Properties panel)."}
        </div>
      </div>
    )
  }
  return (
    <div
      style={{
        ...fullBox,
        overflowY: "auto",
        border: `1px solid ${meta.border}`,
        borderRadius: 8,
        backgroundColor: meta.bg,
        color: meta.color,
        padding: 12,
        fontFamily: ctx.theme.codeFont,
        fontSize: 12,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      <div style={{ fontFamily: ctx.theme.bodyFont, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>
        {label}
      </div>
      {content}
    </div>
  )
}

const METHOD_COLORS: Record<string, string> = {
  GET: "#059669",
  POST: "#2563eb",
  PUT: "#d97706",
  PATCH: "#7c3aed",
  DELETE: "#dc2626",
  OPTIONS: "#475569",
}

function renderApiRequest(props: Props, ctx: RenderContext): ReactNode {
  const method = S(props, "method", "GET")
  const url = resolve(S(props, "url", ""), ctx)
  const headers = S(props, "headers", "")
  const body = S(props, "body", "")
  const showResponse = B(props, "showResponse", true)
  const responseStatus = S(props, "responseStatus", "200 OK")
  const responseBody = S(props, "responseBody", "")
  const mono = ctx.theme.codeFont
  return (
    <div
      style={{
        ...fullBox,
        overflowY: "auto",
        fontFamily: ctx.theme.bodyFont,
        fontSize: 13,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span
          style={{
            backgroundColor: METHOD_COLORS[method] ?? "#475569",
            color: "#ffffff",
            borderRadius: 6,
            padding: "2px 10px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          {method}
        </span>
        <span style={{ fontFamily: mono, fontSize: 12, wordBreak: "break-all", color: ctx.theme.text }}>
          {url}
        </span>
      </div>
      {(headers || body) && (
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: `1px solid ${ctx.theme.border}`,
            borderRadius: 8,
            padding: 10,
            fontFamily: mono,
            fontSize: 11.5,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: ctx.theme.text,
          }}
        >
          {headers}
          {headers && body ? "\n\n" : ""}
          {body}
        </div>
      )}
      {showResponse && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: ctx.theme.primary, marginBottom: 3 }}>
            Response
          </div>
          <div
            style={{
              backgroundColor: "#1e293b",
              color: "#e2e8f0",
              border: `1px solid ${ctx.theme.border}`,
              borderRadius: 8,
              padding: 10,
              fontFamily: mono,
              fontSize: 11.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            <div style={{ color: "#94a3b8", marginBottom: 4 }}>{responseStatus}</div>
            {responseBody}
          </div>
        </div>
      )}
    </div>
  )
}

const TEST_CASE_HEADERS = ["ID", "Test case", "Expected", "Actual", "Status", "Evidence", "Remarks"]

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pass: { bg: "#dcfce7", color: "#166534" },
  passed: { bg: "#dcfce7", color: "#166534" },
  fail: { bg: "#fee2e2", color: "#991b1b" },
  failed: { bg: "#fee2e2", color: "#991b1b" },
  wip: { bg: "#fef3c7", color: "#92400e" },
  blocked: { bg: "#fed7aa", color: "#9a3412" },
  "not run": { bg: "#f3f4f6", color: "#4b5563" },
  "n/a": { bg: "#f3f4f6", color: "#4b5563" },
  "pass with notes": { bg: "#ecfdf5", color: "#065f46" },
}

function renderTestCaseTable(props: Props, ctx: RenderContext): ReactNode {
  const rows = Array.isArray(props.rows) ? (props.rows as string[][]) : []
  const headerRow = B(props, "headerRow", true)
  const fontSize = N(props, "fontSize", 12)
  const border = `1px solid ${ctx.theme.border}`
  const body = headerRow ? rows : rows
  return (
    <table
      style={{
        ...fullBox,
        width: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed",
        fontSize,
        fontFamily: ctx.theme.bodyFont,
      }}
    >
      {headerRow && (
        <thead>
          <tr>
            {TEST_CASE_HEADERS.map((header) => (
              <th
                key={header}
                style={{
                  border,
                  padding: 6,
                  backgroundColor: "#f3f4f6",
                  color: ctx.theme.text,
                  fontWeight: 600,
                  textAlign: "left",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {body.map((row, rowIndex) => {
          const status = (row[4] ?? "").toLowerCase()
          const statusMeta = STATUS_COLORS[status] ?? { bg: "transparent", color: ctx.theme.text }
          return (
            <tr key={rowIndex}>
              {TEST_CASE_HEADERS.map((_, colIndex) => {
                const value = row[colIndex] ?? ""
                const isStatus = colIndex === 4
                return (
                  <td
                    key={colIndex}
                    style={{
                      border,
                      padding: 6,
                      wordBreak: "break-word",
                      verticalAlign: "top",
                      backgroundColor: isStatus ? statusMeta.bg : rowIndex % 2 === 1 ? "#f9fafb" : "transparent",
                    }}
                  >
                    {isStatus && value ? (
                      <span style={{ color: statusMeta.color, fontWeight: 600 }}>{value}</span>
                    ) : (
                      <span style={{ color: ctx.theme.text }}>{value}</span>
                    )}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const EDU_META: Record<string, { label: string; bg: string; border: string; color: string; glyph: string; mono?: boolean }> = {
  definition: { label: "Definition", bg: "#eff6ff", border: "#93c5fd", color: "#1e3a8a", glyph: "ℹ" },
  example: { label: "Example", bg: "#ecfdf5", border: "#6ee7b7", color: "#065f46", glyph: "✎" },
  question: { label: "Question", bg: "#fffbeb", border: "#fcd34d", color: "#92400e", glyph: "?" },
  answer: { label: "Answer", bg: "#f0fdfa", border: "#5eead4", color: "#134e4a", glyph: "✓" },
  takeaway: { label: "Key takeaway", bg: "#faf5ff", border: "#d8b4fe", color: "#6b21a8", glyph: "✦" },
  summary: { label: "Summary", bg: "#f8fafc", border: "#94a3b8", color: "#334155", glyph: "▤" },
  formula: { label: "Formula", bg: "#1e293b", border: "#334155", color: "#e2e8f0", glyph: "ƒ", mono: true },
}

function renderEduBox(props: Props, ctx: RenderContext): ReactNode {
  const variant = S(props, "variant", "definition")
  const meta = EDU_META[variant] ?? EDU_META.definition
  const title = resolve(S(props, "title", ""), ctx)
  const content = resolve(S(props, "content", ""), ctx)
  return (
    <div
      style={{
        ...fullBox,
        overflowY: "auto",
        backgroundColor: meta.bg,
        border: `1px solid ${meta.border}`,
        borderLeft: `4px solid ${meta.color}`,
        borderRadius: 8,
        padding: 12,
        color: meta.color,
        fontFamily: meta.mono ? ctx.theme.codeFont : ctx.theme.bodyFont,
        fontSize: meta.mono ? 13 : 13.5,
        lineHeight: 1.55,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          backgroundColor: meta.color,
          color: "#ffffff",
          borderRadius: 6,
          padding: "2px 8px",
          fontSize: 10.5,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          marginBottom: 8,
          fontStyle: meta.mono ? "italic" : "normal",
        }}
      >
        {meta.glyph} {meta.label}
      </div>
      {title && <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>}
      <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{content}</div>
    </div>
  )
}

function parseChartData(raw: string): { label: string; value: number }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line) => {
      const match = line.match(/^(.*?)[:=]\s*(\d+(?:\.\d+)?)$/)
      if (match) return { label: match[1].trim(), value: Number(match[2]) }
      const parts = line.split(/\s+/)
      const value = Number(parts[parts.length - 1])
      if (Number.isFinite(value)) {
        return { label: parts.slice(0, -1).join(" "), value }
      }
      return { label: line, value: 0 }
    })
}

function renderChart(props: Props, ctx: RenderContext): ReactNode {
  const title = resolve(S(props, "title", ""), ctx)
  const data = parseChartData(S(props, "data", ""))
  const color = S(props, "color") || ctx.theme.primary
  const showValues = B(props, "showValues", true)
  const max = Math.max(1, ...data.map((d) => d.value))
  const chartHeight = 100
  return (
    <div
      style={{
        ...fullBox,
        display: "flex",
        flexDirection: "column",
        fontFamily: ctx.theme.bodyFont,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: ctx.theme.text,
            marginBottom: 10,
          }}
        >
          {title}
        </div>
      )}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 12, paddingBottom: 2 }}>
        {data.map((item, index) => {
          const height = Math.max(2, (item.value / max) * chartHeight)
          return (
            <div
              key={index}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 4,
                minWidth: 0,
              }}
            >
              {showValues && (
                <span style={{ fontSize: 11, fontWeight: 600, color: ctx.theme.text }}>
                  {item.value}
                </span>
              )}
              <div
                style={{
                  width: "100%",
                  maxWidth: 56,
                  height: `${height}%`,
                  backgroundColor: color,
                  borderRadius: "4px 4px 0 0",
                  opacity: 0.85 + (index % 3) * 0.05,
                }}
              />
              <span
                style={{
                  fontSize: 10.5,
                  color: ctx.theme.text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
                {item.label}
              </span>
            </div>
          )
        })}
        {data.length === 0 && (
          <div style={{ fontSize: 13, color: ctx.theme.text, opacity: 0.6 }}>
            Add data as lines: “Label 12”
          </div>
        )}
      </div>
    </div>
  )
}

function renderProgress(props: Props, ctx: RenderContext): ReactNode {
  const label = resolve(S(props, "label", ""), ctx)
  const value = Math.min(100, Math.max(0, N(props, "value", 0)))
  const color = S(props, "color") || ctx.theme.accent
  return (
    <div
      style={{
        ...fullBox,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 6,
        fontFamily: ctx.theme.bodyFont,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: ctx.theme.text }}>{label}</span>
        {B(props, "showValue", true) && (
          <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}%</span>
        )}
      </div>
      <div
        style={{
          width: "100%",
          height: N(props, "radius", 4) * 2 + 6,
          backgroundColor: "#e5e7eb",
          borderRadius: N(props, "radius", 4),
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: N(props, "radius", 4),
            transition: "width 0.3s",
          }}
        />
      </div>
    </div>
  )
}

const BADGE_META: Record<string, (theme: RenderContext["theme"]) => { bg: string; color: string }> = {
  primary: (theme) => ({ bg: theme.primary, color: "#ffffff" }),
  secondary: (theme) => ({ bg: theme.secondary, color: theme.text }),
  accent: (theme) => ({ bg: theme.accent, color: "#ffffff" }),
  success: () => ({ bg: "#dcfce7", color: "#166534" }),
  warning: () => ({ bg: "#fef3c7", color: "#92400e" }),
  error: () => ({ bg: "#fee2e2", color: "#991b1b" }),
  muted: () => ({ bg: "#f3f4f6", color: "#4b5563" }),
}

function renderBadge(props: Props, ctx: RenderContext): ReactNode {
  const variant = S(props, "variant", "primary")
  const meta = BADGE_META[variant]?.(ctx.theme) ?? BADGE_META.primary(ctx.theme)
  const text = resolve(S(props, "text", ""), ctx)
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: meta.bg,
        color: meta.color,
        borderRadius: 999,
        padding: "4px 12px",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: ctx.theme.bodyFont,
      }}
    >
      {text}
    </div>
  )
}

function renderEmbed(props: Props, ctx: RenderContext): ReactNode {
  const kind = S(props, "kind", "pdf")
  const url = S(props, "url")
  const label = resolve(S(props, "label", "Imported document"), ctx)
  if (!url) {
    return (
      <div
        style={{
          ...fullBox,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          border: `1.5px dashed ${ctx.theme.border}`,
          borderRadius: 8,
          backgroundColor: "#f8fafc",
          color: ctx.theme.text,
          fontFamily: ctx.theme.bodyFont,
          fontSize: 13,
        }}
      >
        <span style={{ fontSize: 24 }}>{kind === "pdf" ? "PDF" : "DOCX"}</span>
        {label}
      </div>
    )
  }
  if (kind === "docx") {
    return (
      <div style={{ ...fullBox, backgroundColor: "#ffffff" }}>
        <p style={{ fontFamily: ctx.theme.bodyFont, fontSize: 12, color: ctx.theme.text, padding: 8 }}>
          {label}
        </p>
      </div>
    )
  }
  return (
    <iframe
      src={url}
      title={label}
      style={{ width: "100%", height: "100%", border: 0, backgroundColor: "#ffffff" }}
    />
  )
}

const RENDERERS: Record<string, RenderFn> = {
  text: renderText,
  heading: renderHeading,
  image: renderImage,
  shape: renderShape,
  divider: renderDivider,
  container: renderContainer,
  header: renderHeader,
  footer: renderFooter,
  pageNumber: renderPageNumber,
  table: renderTable,
  chart: renderChart,
  progress: renderProgress,
  callout: renderCallout,
  list: renderList,
  checklist: renderChecklist,
  code: renderCode,
  link: renderLink,
  severityBadge: renderSeverityBadge,
  finding: renderFinding,
  evidence: renderEvidence,
  apiRequest: renderApiRequest,
  testCaseTable: renderTestCaseTable,
  eduBox: renderEduBox,
  badge: renderBadge,
  embed: renderEmbed,
}

export function renderElement(el: DocElement, ctx: RenderContext): ReactNode {
  const render = RENDERERS[el.type]
  if (!render) {
    return (
      <div
        style={{
          ...fullBox,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f3f4f6",
          color: "#6b7280",
          fontSize: 12,
          border: "1px dashed #cbd5e1",
          borderRadius: 6,
          fontFamily: ctx.theme.bodyFont,
        }}
      >
        Unknown component: {el.type}
      </div>
    )
  }
  return render(el.props, ctx)
}
