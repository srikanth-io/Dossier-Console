export const SYSTEM_VARIABLES = [
  { name: "page_number", value: "1" },
  { name: "total_pages", value: "1" },
] as const

const VARIABLE_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g

export function extractVariables(text: string): string[] {
  const found = new Set<string>()
  const source = typeof text === "string" ? text : ""
  for (const match of source.matchAll(VARIABLE_RE)) {
    found.add(match[1])
  }
  return Array.from(found)
}

export function resolveText(
  text: string,
  variables: Record<string, string>
): string {
  if (typeof text !== "string") return ""
  return text.replace(VARIABLE_RE, (full, name: string) => {
    const value = variables[name]
    return value !== undefined && value !== "" ? value : full
  })
}

export function variableMap(variables: { name: string; value: string }[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const variable of variables) {
    map[variable.name] = variable.value
  }
  return map
}
