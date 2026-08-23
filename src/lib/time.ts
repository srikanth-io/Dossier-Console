import { commonMessages, relativeTime } from "@/constants/messages/common"

/**
 * Formats an ISO timestamp as a compact relative label ("2m ago", "Yesterday").
 * Timestamps older than a week fall back to a short absolute date.
 */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return commonMessages.none

  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return commonMessages.none

  const diffMs = Date.now() - then
  const minutes = Math.floor(diffMs / 60_000)

  if (minutes < 1) return relativeTime.justNow
  if (minutes < 60) return relativeTime.minutesAgo(minutes)
  if (minutes < 60 * 24) return relativeTime.hoursAgo(Math.floor(minutes / 60))

  const days = Math.floor(minutes / (60 * 24))
  if (days === 1) return relativeTime.yesterday
  if (days < 7) return relativeTime.daysAgo(days)

  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

/** Short absolute timestamp used by audit/log tables. */
export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}
