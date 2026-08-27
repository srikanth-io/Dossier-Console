import { assertAsync } from "@/lib/async"
import { errorCodes, errorMessages } from "@/constants/messages/errors"
import { AppError } from "@/lib/errors"
import { getSupabase } from "@/lib/supabase"

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

export interface UploadResult {
  path: string
  url: string
  size: number
  type: string
}

export async function uploadResume(
  file: File,
  onProgress: (progress: UploadProgress) => void
): Promise<UploadResult> {
  return assertAsync(async () => {
    validateResume(file)

    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new AppError(errorCodes.unauthorized, errorMessages.unauthorized)
    }

    // Simulate progress while the real upload happens
    const progressInterval = setInterval(() => {
      onProgress({
        percent: Math.min(90, Math.round((file.size / MAX_UPLOAD_BYTES) * 50)),
        bytesLoaded: Math.round(file.size * 0.5),
        bytesTotal: file.size,
      })
    }, 200)

    try {
      const filePath = `resumes/${session.user.id}/${crypto.randomUUID()}/${file.name}`
      const { data, error } = await supabase.storage
        .from("evidence")
        .upload(filePath, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        })

      clearInterval(progressInterval)

      if (error) {
        throw new AppError(errorCodes.network, errorMessages.uploadFailed)
      }

      onProgress({ percent: 100, bytesLoaded: file.size, bytesTotal: file.size })

      const {
        data: { publicUrl },
      } = supabase.storage.from("evidence").getPublicUrl(data.path)

      return { path: data.path, url: publicUrl, size: file.size, type: file.type }
    } catch (err) {
      clearInterval(progressInterval)
      throw err
    }
  }, "uploadResume")
}

export async function uploadEvidence(
  findingId: string,
  file: File,
  onProgress: (progress: UploadProgress) => void
): Promise<UploadResult> {
  return assertAsync(async () => {
    const supabase = getSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new AppError(errorCodes.unauthorized, errorMessages.unauthorized)
    }

    const progressInterval = setInterval(() => {
      onProgress({
        percent: Math.min(90, Math.round((file.size / MAX_UPLOAD_BYTES) * 50)),
        bytesLoaded: Math.round(file.size * 0.5),
        bytesTotal: file.size,
      })
    }, 200)

    try {
      const filePath = `evidence/${session.user.id}/${findingId}/${crypto.randomUUID()}/${file.name}`
      const { data, error } = await supabase.storage
        .from("evidence")
        .upload(filePath, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        })

      clearInterval(progressInterval)

      if (error) {
        throw new AppError(errorCodes.network, errorMessages.uploadFailed)
      }

      onProgress({ percent: 100, bytesLoaded: file.size, bytesTotal: file.size })

      const {
        data: { publicUrl },
      } = supabase.storage.from("evidence").getPublicUrl(data.path)

      return { path: data.path, url: publicUrl, size: file.size, type: file.type }
    } catch (err) {
      clearInterval(progressInterval)
      throw err
    }
  }, "uploadEvidence")
}
