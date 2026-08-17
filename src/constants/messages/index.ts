import { commonMessages } from "@/constants/messages/common"
import { dashboard } from "@/constants/messages/dashboard"
import { dossiers } from "@/constants/messages/dossiers"
import { errorCodes, errorMessages } from "@/constants/messages/errors"
import { landing } from "@/constants/messages/landing"
import { layout, nav } from "@/constants/messages/layout"
import { login } from "@/constants/messages/login"
import { notifications } from "@/constants/messages/notifications"
import { pagesMsg } from "@/constants/messages/pages"
import { projects } from "@/constants/messages/projects"
import { resume } from "@/constants/messages/resume"
import { settings } from "@/constants/messages/settings"
import { studio } from "@/constants/messages/studio"
import { templates } from "@/constants/messages/templates"

export const messages = {
  common: commonMessages,
  errors: errorMessages,
  errorCodes,
  layout,
  nav,
  dashboard,
  dossiers,
  projects,
  pages: pagesMsg,
  settings,
  resume,
  templates,
  studio,
  landing,
  login,
  notifications,
} as const
