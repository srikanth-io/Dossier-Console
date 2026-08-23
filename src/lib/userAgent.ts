/** Minimal user-agent description for audit tables. Returns neutral
 *  placeholders when the agent string is missing or unrecognised. */

const NEUTRAL = "—"

export function browserFromUserAgent(ua: string | null | undefined): string {
  if (!ua) return NEUTRAL
  const match = /(Edg|Chrome|Firefox|Safari|OPR)\/([\d.]+)/.exec(ua)
  if (!match) return "Unknown"
  const name =
    match[1] === "Edg" ? "Edge" : match[1] === "OPR" ? "Opera" : match[1]
  const major = match[2].split(".")[0] ?? "0"
  return `${name} ${major}.0`
}

export function osFromUserAgent(ua: string | null | undefined): string {
  if (!ua) return NEUTRAL
  if (/Windows NT/.test(ua)) return "Windows"
  if (/Mac OS X/.test(ua)) return "macOS"
  if (/iPhone|iPad/.test(ua)) return "iOS"
  if (/Android/.test(ua)) return "Android"
  if (/Linux/.test(ua)) return "Linux"
  return "Unknown"
}
