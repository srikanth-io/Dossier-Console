import { API } from "@/constants/app"
import { errorCodes, errorMessages } from "@/constants/messages/errors"
import { AppError } from "@/lib/errors"
import { assertAsync } from "@/lib/async"

type ApiOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown
  headers?: Record<string, string>
}

const DEFAULT_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
}

function httpError(status: number): AppError {
  if (status === 401) {
    return new AppError(errorCodes.unauthorized, errorMessages.unauthorized)
  }
  if (status === 404) {
    return new AppError(errorCodes.notFound, errorMessages.notFound)
  }
  return new AppError(errorCodes.http, errorMessages.http)
}

export async function apiClient<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  return assertAsync(async () => {
    const response = await fetch(`${API.baseUrl}${path}`, {
      ...options,
      headers: { ...DEFAULT_HEADERS, ...options.headers },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      throw httpError(response.status)
    }

    return (await response.json()) as T
  }, "apiClient")
}
