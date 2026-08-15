import { commonMessages } from "@/constants/messages/common"
import { dashboard } from "@/constants/messages/dashboard"
import { dossiers } from "@/constants/messages/dossiers"
import { errorCodes, errorMessages } from "@/constants/messages/errors"
import { landing } from "@/constants/messages/landing"
import { layout, nav } from "@/constants/messages/layout"
import { login } from "@/constants/messages/login"
import { reports } from "@/constants/messages/reports"
import { settings } from "@/constants/messages/settings"
import { users } from "@/constants/messages/users"

export const messages = {
  common: commonMessages,
  errors: errorMessages,
  errorCodes,
  layout,
  nav,
  dashboard,
  dossiers,
  users,
  reports,
  settings,
  landing,
  login,
} as const
