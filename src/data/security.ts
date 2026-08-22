export type Device = {
  id: string
  name: string
  browser: string
  os: string
  ipAddress: string
  lastSeen: string
  firstSeen: string
  isCurrent: boolean
}

export type LogEntry = {
  id: string
  timestamp: string
  action: string
  category: "login" | "security" | "settings" | "timesheet" | "system"
  screen: string
  browser: string
  device: string
  ipAddress: string
  request: string
  details: string
}

export const devices: Device[] = [
  {
    id: "DEV-001",
    name: "Chrome on Windows",
    browser: "Chrome 128.0",
    os: "Windows 11",
    ipAddress: "103.45.67.89",
    lastSeen: "2026-08-17 18:30",
    firstSeen: "2026-07-01 09:15",
    isCurrent: true,
  },
  {
    id: "DEV-002",
    name: "Safari on iPhone",
    browser: "Safari 19.0",
    os: "iOS 19.4",
    ipAddress: "103.45.67.92",
    lastSeen: "2026-08-16 12:45",
    firstSeen: "2026-07-10 14:20",
    isCurrent: false,
  },
  {
    id: "DEV-003",
    name: "Firefox on macOS",
    browser: "Firefox 131.0",
    os: "macOS Sequoia 15.1",
    ipAddress: "103.45.67.101",
    lastSeen: "2026-08-14 08:00",
    firstSeen: "2026-08-01 10:30",
    isCurrent: false,
  },
  {
    id: "DEV-004",
    name: "Edge on Windows",
    browser: "Edge 128.0",
    os: "Windows 11",
    ipAddress: "103.45.67.89",
    lastSeen: "2026-08-12 16:20",
    firstSeen: "2026-08-10 09:00",
    isCurrent: false,
  },
]

export const logs: LogEntry[] = [
  {
    id: "LOG-001",
    timestamp: "2026-08-17 18:30:12",
    action: "Signed in",
    category: "login",
    screen: "/login",
    browser: "Chrome 128.0",
    device: "Windows 11",
    ipAddress: "103.45.67.89",
    request: "POST /api/auth/login",
    details: "Successful authentication",
  },
  {
    id: "LOG-002",
    timestamp: "2026-08-17 18:31:05",
    action: "Profile updated",
    category: "settings",
    screen: "/app/settings",
    browser: "Chrome 128.0",
    device: "Windows 11",
    ipAddress: "103.45.67.89",
    request: "PUT /api/user/profile",
    details: "Updated display name",
  },
  {
    id: "LOG-003",
    timestamp: "2026-08-17 17:45:30",
    action: "Timesheet submitted",
    category: "timesheet",
    screen: "/app/projects/PRJ-001",
    browser: "Chrome 128.0",
    device: "Windows 11",
    ipAddress: "103.45.67.89",
    request: "POST /api/timesheets/submit",
    details: "Project A - 8.0 hours",
  },
  {
    id: "LOG-004",
    timestamp: "2026-08-17 17:46:00",
    action: "Email sent",
    category: "system",
    screen: "/app/projects/PRJ-001",
    browser: "Chrome 128.0",
    device: "Windows 11",
    ipAddress: "103.45.67.89",
    request: "POST /api/email/send",
    details: "Daily report sent to admin@dossier.dev",
  },
  {
    id: "LOG-005",
    timestamp: "2026-08-16 12:45:22",
    action: "Signed in",
    category: "login",
    screen: "/login",
    browser: "Safari 19.0",
    device: "iOS 19.4",
    ipAddress: "103.45.67.92",
    request: "POST /api/auth/login",
    details: "Successful authentication",
  },
  {
    id: "LOG-006",
    timestamp: "2026-08-15 09:10:00",
    action: "MFA enabled",
    category: "security",
    screen: "/app/settings",
    browser: "Chrome 128.0",
    device: "Windows 11",
    ipAddress: "103.45.67.89",
    request: "POST /api/security/mfa/totp",
    details: "Authenticator app configured",
  },
  {
    id: "LOG-007",
    timestamp: "2026-08-14 08:00:15",
    action: "Signed in",
    category: "login",
    screen: "/login",
    browser: "Firefox 131.0",
    device: "macOS Sequoia 15.1",
    ipAddress: "103.45.67.101",
    request: "POST /api/auth/login",
    details: "Successful authentication",
  },
  {
    id: "LOG-008",
    timestamp: "2026-08-14 08:02:30",
    action: "Settings updated",
    category: "settings",
    screen: "/app/settings",
    browser: "Firefox 131.0",
    device: "macOS Sequoia 15.1",
    ipAddress: "103.45.67.101",
    request: "PUT /api/settings/notifications",
    details: "Email digest enabled",
  },
  {
    id: "LOG-009",
    timestamp: "2026-08-13 14:20:45",
    action: "Failed login attempt",
    category: "security",
    screen: "/login",
    browser: "Chrome 128.0",
    device: "Windows 11",
    ipAddress: "203.0.113.50",
    request: "POST /api/auth/login",
    details: "Invalid credentials - 1 attempt",
  },
  {
    id: "LOG-010",
    timestamp: "2026-08-12 16:20:00",
    action: "Signed in",
    category: "login",
    screen: "/login",
    browser: "Edge 128.0",
    device: "Windows 11",
    ipAddress: "103.45.67.89",
    request: "POST /api/auth/login",
    details: "Successful authentication",
  },
  {
    id: "LOG-011",
    timestamp: "2026-08-12 16:25:00",
    action: "New device registered",
    category: "security",
    screen: "/app/settings",
    browser: "Edge 128.0",
    device: "Windows 11",
    ipAddress: "103.45.67.89",
    request: "POST /api/security/devices",
    details: "Edge on Windows added to trusted devices",
  },
  {
    id: "LOG-012",
    timestamp: "2026-08-11 10:00:00",
    action: "Excel updated",
    category: "timesheet",
    screen: "/app/projects/PRJ-002",
    browser: "Chrome 128.0",
    device: "Windows 11",
    ipAddress: "103.45.67.89",
    request: "POST /api/excel/update",
    details: "Timesheet_2026_08.xlsx updated",
  },
]
