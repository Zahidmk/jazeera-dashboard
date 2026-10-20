// Shared types + helpers for the Merchandiser admin pages (attendance, visits & feedback)

export interface PageMeta { page: number; limit: number; total: number }

export interface UserBrief { id: string; name: string; email?: string; phone?: string | null; isActive?: boolean }

export interface AttendanceRow {
  id: string
  isOpen: boolean
  checkInAt: string
  checkInLat: number
  checkInLng: number
  checkInAccuracy: number | null
  checkInDeviceId: string
  checkInBiometric: boolean
  checkInBiometricMethod: string | null
  checkInSelfieUrl: string
  checkOutAt: string | null
  checkOutLat: number | null
  checkOutLng: number | null
  checkOutDeviceId: string | null
  checkOutSelfieUrl: string | null
  durationMinutes: number | null
  flagged: boolean
  adminNote: string | null
  merchandiser: UserBrief
}

export interface DeviceRow {
  id: string
  deviceId: string
  label: string | null
  isApproved: boolean
  firstSeenAt: string
  lastSeenAt: string
  user: UserBrief
}

export interface VisitRow {
  id: string
  status: "IN_PROGRESS" | "COMPLETED"
  startedAt: string
  endedAt: string | null
  startDistanceM: number | null
  outOfRange: boolean
  notes: string | null
  merchandiser: UserBrief
  customer: { id: string; name: string; phone?: string | null; address?: string | null }
  _count: { feedback: number }
}

export const FEEDBACK_CATEGORIES = ["STOCK", "DISPLAY", "PRICING", "COMPETITOR", "SERVICE", "OTHER"] as const
export const FEEDBACK_STATUSES = ["NEW", "REVIEWED", "RESOLVED"] as const

export interface FeedbackRow {
  id: string
  category: string
  rating: number | null
  comments: string
  followUpRequired: boolean
  status: (typeof FEEDBACK_STATUSES)[number]
  adminNote: string | null
  createdAt: string
  customer: { id: string; name: string }
  merchandiser: { id: string; name: string }
}

// Attendance is a Saudi-time concept, so always display Riyadh time regardless of the viewer's timezone.
const TZ = "Asia/Riyadh"

export const fmtDateTime = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleString("en-GB", { timeZone: TZ, day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"

export const fmtTime = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleTimeString("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }) : "—"

/** Today's date (YYYY-MM-DD) in Riyadh. */
export const todayRiyadh = (): string => new Date().toLocaleDateString("en-CA", { timeZone: TZ })

export const fmtDuration = (mins: number | null): string => {
  if (mins === null || mins === undefined) return "—"
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`
}

export const mapsLink = (lat: number, lng: number): string => `https://www.google.com/maps?q=${lat},${lng}`
