import { errorMessages } from "@/constants/messages/errors"
import { AppError } from "@/lib/errors"

function describe(error: unknown): string {
  if (error instanceof AppError) return error.message
  if (error instanceof Error) return error.message
  return errorMessages.unexpected
}

export function getErrorMessage(error: unknown): string {
  return describe(error)
}

export function logError(error: unknown, context?: string): void {
  const prefix = context ? `[${context}]` : "[app]"
  if (typeof console !== "undefined") {
    console.error(`${prefix} ${describe(error)}`, error)
  }
}

export async function safeAsync<T>(
  operation: () => Promise<T>,
  options?: {
    context?: string
    onError?: (error: unknown) => void
  }
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    const handle =
      options?.onError ?? ((e: unknown) => logError(e, options?.context))
    handle(error)
    return null
  }
}

export async function assertAsync<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    logError(error, context)
    throw error
  }
}
