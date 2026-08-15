import { assertAsync } from "@/lib/async"
import { errorCodes, errorMessages } from "@/constants/messages/errors"
import { AppError } from "@/lib/errors"

export type UploadProgress = {
  percent: number
  bytesLoaded: number
  bytesTotal: number
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const MAX_UPLOAD_FILES = 5

export function isPdfName(name: string): boolean {
  return name.toLowerCase().endsWith(".pdf")
}

export function isDocxName(name: string): boolean {
  return /\.docx$/i.test(name)
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isPdf(name: string, type: string): boolean {
  return type === "application/pdf" || name.toLowerCase().endsWith(".pdf")
}

function isWord(name: string, type: string): boolean {
  return (
    type === "application/msword" ||
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    /\.docx?$/i.test(name)
  )
}

export function validateResume(file: File): void {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new AppError(errorCodes.validation, errorMessages.uploadTooLarge)
  }
  if (!isPdf(file.name, file.type) && !isWord(file.name, file.type)) {
    throw new AppError(errorCodes.validation, errorMessages.unsupportedType)
  }
}

export async function uploadResume(
  file: File,
  onProgress: (progress: UploadProgress) => void
): Promise<void> {
  return assertAsync(async () => {
    validateResume(file)

    const steps = 40
    const stepMs = 60
    let failures = 0

    for (let step = 1; step <= steps; step += 1) {
      await delay(stepMs)
      const percent = Math.round((step / steps) * 100)
      onProgress({
        percent,
        bytesLoaded: Math.round((percent / 100) * file.size),
        bytesTotal: file.size,
      })
      if (Math.random() < 0.08) failures += 1
      if (failures > 1) {
        throw new AppError(errorCodes.network, errorMessages.uploadFailed)
      }
    }
  }, "uploadResume")
}
