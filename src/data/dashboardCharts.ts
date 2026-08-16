export const weeklyCreated = [42, 58, 51, 73, 66, 89, 74]

export type DocumentTypeKey =
  | "vapt"
  | "invoices"
  | "resume"
  | "study"
  | "proposals"

export const documentTypes: { key: DocumentTypeKey; value: number }[] = [
  { key: "vapt", value: 320 },
  { key: "invoices", value: 214 },
  { key: "resume", value: 96 },
  { key: "study", value: 58 },
  { key: "proposals", value: 41 },
]
