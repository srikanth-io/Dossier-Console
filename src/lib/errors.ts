import { errorCodes, errorMessages } from "@/constants/messages/errors"

export class AppError extends Error {
  readonly code: string

  constructor(
    code: string = errorCodes.unknown,
    message: string = errorMessages.unexpected,
    options?: { cause?: unknown }
  ) {
    super(message, options)
    this.name = "AppError"
    this.code = code
  }
}
