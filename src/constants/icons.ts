import { ActivityIcon } from "@/components/icons/activity"
import { ArrowLeftIcon } from "@/components/icons/arrow-left"
import { ArrowRightIcon } from "@/components/icons/arrow-right"
import { ArrowUpRightIcon } from "@/components/icons/arrow-up-right"
import { AtSignIcon } from "@/components/icons/at-sign"
import { BadgeAlertIcon } from "@/components/icons/badge-alert"
import { BellIcon } from "@/components/icons/bell"
import { ChartColumnIncreasingIcon } from "@/components/icons/chart-column-increasing"
import { CheckIcon } from "@/components/icons/check"
import { ChevronDownIcon } from "@/components/icons/chevron-down"
import { ChevronLeftIcon } from "@/components/icons/chevron-left"
import { ChevronRightIcon } from "@/components/icons/chevron-right"
import { ChevronUpIcon } from "@/components/icons/chevron-up"
import { CircleCheckIcon } from "@/components/icons/circle-check"
import { ClockIcon } from "@/components/icons/clock"
import { CopyIcon } from "@/components/icons/copy"
import { DatabaseBackupIcon } from "@/components/icons/database-backup"
import { DeleteIcon } from "@/components/icons/delete"
import { DownloadIcon } from "@/components/icons/download"
import { EyeIcon } from "@/components/icons/eye"
import { EyeOffIcon } from "@/components/icons/eye-off"
import { FileChartLineIcon } from "@/components/icons/file-chart-line"
import { FileTextIcon } from "@/components/icons/file-text"
import { FolderCodeIcon } from "@/components/icons/folder-code"
import { FolderOpenIcon } from "@/components/icons/folder-open"
import { FolderPlusIcon } from "@/components/icons/folder-plus"
import { GripHorizontalIcon } from "@/components/icons/grip-horizontal"
import { HardDriveDownloadIcon } from "@/components/icons/hard-drive-download"
import { LayoutGridIcon } from "@/components/icons/layout-grid"
import { LoaderCircleIcon } from "@/components/icons/loader-circle"
import { LockKeyholeIcon } from "@/components/icons/lock-keyhole"
import { LogoutIcon } from "@/components/icons/logout"
import { MenuIcon } from "@/components/icons/menu"
import { PlayIcon } from "@/components/icons/play"
import { PlusIcon } from "@/components/icons/plus"
import { RedoIcon } from "@/components/icons/redo"
import { RefreshCWIcon } from "@/components/icons/refresh-cw"
import { SearchIcon } from "@/components/icons/search"
import { SettingsIcon } from "@/components/icons/settings"
import { ShieldCheckIcon } from "@/components/icons/shield-check"
import { SmartphoneNfcIcon } from "@/components/icons/smartphone-nfc"
import { SparklesIcon } from "@/components/icons/sparkles"
import { SquarePenIcon } from "@/components/icons/square-pen"
import { UndoIcon } from "@/components/icons/undo"
import { UploadIcon } from "@/components/icons/upload"
import { UserIcon } from "@/components/icons/user"
import { UserPlusIcon } from "@/components/icons/user-plus"
import { UsersIcon } from "@/components/icons/users"
import { XIcon } from "@/components/icons/x"

export const icons = {
  brand: DatabaseBackupIcon,
  dashboard: LayoutGridIcon,
  dossiers: FolderOpenIcon,
  templates: GripHorizontalIcon,
  users: UsersIcon,
  reports: ChartColumnIncreasingIcon,
  settings: SettingsIcon,
  search: SearchIcon,
  notifications: BellIcon,
  chevronDown: ChevronDownIcon,
  signOut: LogoutIcon,
  newDossier: FolderPlusIcon,
  inviteUser: UserPlusIcon,
  download: DownloadIcon,
  save: HardDriveDownloadIcon,
  report: FileChartLineIcon,
  activity: ActivityIcon,
  pendingReviews: ClockIcon,
  trendUp: ArrowUpRightIcon,
  arrowRight: ArrowRightIcon,
  check: CheckIcon,
  shield: ShieldCheckIcon,
  lock: LockKeyholeIcon,
  sparkles: SparklesIcon,
  menu: MenuIcon,
  close: XIcon,
  apple: SmartphoneNfcIcon,
  play: PlayIcon,
  eye: EyeIcon,
  eyeOff: EyeOffIcon,
  arrowLeft: ArrowLeftIcon,
  chevronLeft: ChevronLeftIcon,
  user: UserIcon,
  mail: AtSignIcon,
  upload: UploadIcon,
  file: FileTextIcon,
  fileCode: FolderCodeIcon,
  openFile: FolderOpenIcon,
  spinner: LoaderCircleIcon,
  retry: RefreshCWIcon,
  trash: DeleteIcon,
  checkCircle: CircleCheckIcon,
  alertCircle: BadgeAlertIcon,
  pencil: SquarePenIcon,
  plus: PlusIcon,
  split: CopyIcon,
  undo: UndoIcon,
  redo: RedoIcon,
  chevronRight: ChevronRightIcon,
  chevronUp: ChevronUpIcon,
} as const

export type IconName = keyof typeof icons

export function resolveIcon(name: IconName) {
  return icons[name]
}
