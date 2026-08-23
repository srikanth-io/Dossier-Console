import { assertAsync } from "@/lib/async"
import { getSupabase } from "@/lib/supabase"

export const ACCOUNT_STATUSES = [
  "ACTIVE",
  "UNVERIFIED",
  "LOCKED",
  "SUSPENDED",
  "DISABLED",
  "DELETED",
] as const

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number]

export type Profile = {
  id: string
  email: string
  name: string
  username: string
  accountStatus: AccountStatus
}

function toAccountStatus(value: unknown): AccountStatus | null {
  return ACCOUNT_STATUSES.includes(value as AccountStatus)
    ? (value as AccountStatus)
    : null
}

/**
 * Fetches the caller's own profile row via RLS (`profiles_select_own`).
 * Returns null when the row does not exist yet.
 */
export async function getOwnProfile(): Promise<Profile | null> {
  return assertAsync(async () => {
    const { data, error } = await getSupabase()
      .from("profiles")
      .select("id, email, name, username, account_status")
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    return {
      id: data.id,
      email: data.email ?? "",
      name: data.name ?? "",
      username: data.username ?? "",
      accountStatus: toAccountStatus(data.account_status) ?? "ACTIVE",
    }
  }, "profiles.getOwnProfile")
}
