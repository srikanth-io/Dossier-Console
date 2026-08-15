export const RESUME_PREVIEW_CLASSES =
  "resume-preview text-sm text-foreground [&_hr]:my-3 [&_hr]:border-t [&_hr]:border-foreground/15 [&_.hfill]:inline-block [&_.hfill]:w-16 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function findClosing(text: string, openBraceIndex: number): number {
  let depth = 0
  for (let i = openBraceIndex; i < text.length; i += 1) {
    if (text[i] === "{") depth += 1
    else if (text[i] === "}") {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return text.length
}

function extractBody(source: string): string {
  const begin = source.indexOf("\\begin{document}")
  const end = source.indexOf("\\end{document}")
  if (begin === -1 || end === -1) return source
  return source.slice(begin + "\\begin{document}".length, end)
}

function stripComments(source: string): string {
  const PLACEHOLDER = "__PCT__"
  return source
    .split("\n")
    .map((line) =>
      line
        .replace(/\\%/g, PLACEHOLDER) // protect escaped \% temporarily
        .replace(/(^|[^\\])%.*$/, "$1") // strip real comments
        .replaceAll(PLACEHOLDER, "%")
    )
    .join("\n")
}

const FONT_COMMANDS: Record<string, string> = {
  "\\LARGE": "text-2xl font-semibold",
  "\\large": "text-xl font-semibold",
  "\\Large": "text-3xl font-semibold",
  "\\small": "text-sm",
  "\\scriptsize": "text-xs",
}

export function renderInline(text: string): string {
  let html = ""
  let buffer = ""

  const flush = () => {
    if (buffer) {
      html += escapeHtml(buffer)
      buffer = ""
    }
  }

  let i = 0
  while (i < text.length) {
    const ch = text[i]

    if (ch === "\\") {
      const next = text[i + 1]
      if (next === undefined) {
        buffer += ch
        i += 1
        continue
      }
      if (next === "\\") {
        flush()
        html += "<br/>"
        i += 2
        continue
      }
      if (next === "%") {
        buffer += "%"
        i += 2
        continue
      }
      if (next === "&") {
        buffer += "&"
        i += 2
        continue
      }
      if (next === "$" || next === "#" || next === "{" || next === "}") {
        buffer += next
        i += 2
        continue
      }

      const commandMatch = text.slice(i).match(/^\\[a-zA-Z]+\*?/)
      if (!commandMatch) {
        buffer += ch
        i += 1
        continue
      }
      const command = commandMatch[0]
      const argStart = i + command.length

      if (FONT_COMMANDS[command]) {
        if (text[argStart] === "{") {
          const close = findClosing(text, argStart)
          flush()
          html += `<span class="${FONT_COMMANDS[command]}">${renderInline(text.slice(argStart + 1, close))}</span>`
          i = close + 1
        } else {
          // Ungrouped size switches are skipped in the preview.
          i = argStart
        }
        continue
      }

      if (command === "\\textbf" || command === "\\textit" || command === "\\texttt" || command === "\\emph" || command === "\\underline") {
        if (text[argStart] === "{") {
          const close = findClosing(text, argStart)
          flush()
          const tag =
            command === "\\textbf"
              ? "strong"
              : command === "\\texttt"
                ? "code"
                : command === "\\underline"
                  ? "span"
                  : "em"
          html += `<${tag}${tag === "span" ? ' class="underline"' : ""}>${renderInline(text.slice(argStart + 1, close))}</${tag}>`
          i = close + 1
          continue
        }
      }

      if (command === "\\href") {
        const urlMatch = text.slice(argStart).match(/^\{([^}]*)\}/)
        if (urlMatch) {
          const url = urlMatch[1]
          const textStart = argStart + urlMatch[0].length
          if (text[textStart] === "{") {
            const close = findClosing(text, textStart)
            flush()
            html += `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${renderInline(text.slice(textStart + 1, close))}</a>`
            i = close + 1
            continue
          }
        }
      }

      if (command === "\\url") {
        const urlMatch = text.slice(argStart).match(/^\{([^}]*)\}/)
        if (urlMatch) {
          flush()
          html += `<a href="${escapeHtml(urlMatch[1])}" target="_blank" rel="noreferrer">${escapeHtml(urlMatch[1])}</a>`
          i = argStart + urlMatch[0].length
          continue
        }
      }

      if (command === "\\hfill") {
        flush()
        html += '<span class="hfill"></span>'
        i = argStart
        continue
      }

      if (command === "\\hrule") {
        flush()
        html += "<hr/>"
        i = argStart
        continue
      }

      const skipMatch = text.slice(i).match(/^\\(vspace|hspace|vskip|hskip)\{([^}]*)\}/)
      if (skipMatch) {
        i += skipMatch[0].length
        continue
      }

      const spaceMatch = text.slice(i).match(/^\\(smallskip|medskip|bigskip|noindent|newpage|clearpage|pagestyle|parindent)/)
      if (spaceMatch) {
        i += spaceMatch[0].length
        continue
      }

      const other = text.slice(i).match(/^\\[a-zA-Z]+/)
      if (other) {
        i += other[0].length
        continue
      }

      buffer += ch
      i += 1
      continue
    }

    if (ch === "{") {
      const close = findClosing(text, i)
      flush()
      const inner = text.slice(i + 1, close)
      const fontMatch = inner.trim().match(/^\\[a-zA-Z]+/)
      if (fontMatch && FONT_COMMANDS[fontMatch[0]]) {
        html += `<span class="${FONT_COMMANDS[fontMatch[0]]}">${renderInline(inner.slice(fontMatch[0].length))}</span>`
      } else {
        html += renderInline(inner)
      }
      i = close + 1
      continue
    }

    if (ch === "}") {
      i += 1
      continue
    }

    if (ch === "$") {
      const close = text.indexOf("$", i + 1)
      if (close !== -1) {
        flush()
        html += `<code class="rounded bg-muted px-1 py-0.5 text-xs">${escapeHtml(text.slice(i + 1, close))}</code>`
        i = close + 1
        continue
      }
    }

    if (ch === "~") {
      buffer += "&nbsp;"
      i += 1
      continue
    }

    buffer += ch
    i += 1
  }

  flush()
  return html
}

type Block =
  | { kind: "section"; title: string; starred: boolean }
  | { kind: "itemize" | "enumerate"; items: string[] }
  | { kind: "center"; content: string }
  | { kind: "columns"; blocks: Block[] }
  | { kind: "paragraph"; content: string }
  | { kind: "title"; content: string }

function renderBlock(block: Block): string {
  switch (block.kind) {
    case "section":
      return block.starred
        ? `<h2 class="mt-4 font-semibold text-xs tracking-wide text-muted-foreground uppercase">${renderInline(block.title)}</h2>`
        : `<h2 class="mt-4 border-b pb-0.5 text-sm font-bold tracking-wide uppercase">${renderInline(block.title)}</h2>`
    case "itemize":
    case "enumerate": {
      const tag = block.kind === "itemize" ? "ul" : "ol"
      const items = block.items
        .map((item) => {
          const line = renderInline(item)
          return `<li class="${block.kind === "itemize" ? "list-disc" : "list-decimal"} ml-4">${line}</li>`
        })
        .join("")
      return `<${tag} class="space-y-1 py-1">${items}</${tag}>`
    }
    case "center":
      return `<div class="text-center">${renderInline(block.content)}</div>`
    case "columns": {
      const inner = block.blocks
      if (inner.length === 0) return ""
      if (inner.length === 1) {
        return `<div class="grid gap-4 sm:grid-cols-2">${renderBlock(inner[0])}</div>`
      }
      const mid = Math.ceil(inner.length / 2)
      const left = inner.slice(0, mid).map(renderBlock).join("")
      const right = inner.slice(mid).map(renderBlock).join("")
      return `<div class="grid gap-4 sm:grid-cols-2"><div class="min-w-0">${left}</div><div class="min-w-0">${right}</div></div>`
    }
    case "title":
      return renderInline(block.content)
    case "paragraph":
      return `<p class="leading-relaxed">${renderInline(block.content)}</p>`
  }
}

function parseBlocks(lines: string[]): Block[] {
  const blocks: Block[] = []

  let index = 0

  while (index < lines.length) {
    const line = lines[index].trim()

    if (!line) {
      index += 1
      continue
    }

    const sectionMatch = line.match(/^\\section\*?\{([^}]*)\}/)
    if (sectionMatch) {
      blocks.push({
        kind: "section",
        title: sectionMatch[1],
        starred: line.startsWith("\\section*"),
      })
      index += 1
      continue
    }

    const envMatch = line.match(/^\\begin\{([a-zA-Z*]+)\}/)
    if (envMatch) {
      const env = envMatch[1]
      const closeToken = `\\end{${env}}`
      const collected: string[] = []
      index += 1
      while (index < lines.length && !lines[index].trim().startsWith(closeToken)) {
        collected.push(lines[index])
        index += 1
      }
      if (index < lines.length) index += 1

      if (env === "itemize" || env === "enumerate") {
        const items = collected
          .join("\n")
          .split("\\item")
          .map((item) => item.trim())
          .filter(Boolean)
          .filter((item) => !/^\[[^\]]*\]$/.test(item))
        blocks.push({ kind: env, items })
      } else if (env === "center") {
        blocks.push({ kind: "center", content: collected.join(" ").trim() })
      } else if (env === "multicols") {
        const inner = parseBlocks(collected)
        if (inner.length > 0) blocks.push({ kind: "columns", blocks: inner })
      } else {
        const content = collected.join(" ").trim()
        if (content) blocks.push({ kind: "paragraph", content })
      }
      continue
    }

    const paragraph: string[] = []
    while (index < lines.length) {
      const current = lines[index].trim()
      if (!current) break
      if (current.startsWith("\\section") || current.startsWith("\\begin{") || current.startsWith("\\end{")) break
      paragraph.push(current)
      index += 1
    }
    if (paragraph.length > 0) {
      const content = paragraph.join(" ").trim()
      if (content.includes("\\hfill")) {
        blocks.push({ kind: "title", content })
      } else {
        blocks.push({ kind: "paragraph", content })
      }
    } else {
      index += 1
    }
  }

  return blocks
}

export function renderLatex(source: string): string {
  const body = stripComments(extractBody(source))
  return parseBlocks(body.split("\n")).map(renderBlock).join("\n")
}

export type LatexSection = {
  title: string
  line: number
}

export function getLatexSections(source: string): LatexSection[] {
  const sections: LatexSection[] = []
  source.split("\n").forEach((line, index) => {
    const match = line.trim().match(/^\\section\*?\{([^}]*)\}/)
    if (match) sections.push({ title: match[1], line: index + 1 })
  })
  return sections
}
