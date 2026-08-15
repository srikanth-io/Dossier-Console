import { errorCodes, errorMessages } from "@/constants/messages/errors"
import { assertAsync } from "@/lib/async"
import { AppError } from "@/lib/errors"

export type AuthUser = {
  id: string
  name: string
  username: string
}

const MOCK_DELAY_MS = 700

export async function signIn(
  username: string,
  password: string
): Promise<AuthUser> {
  return assertAsync(async () => {
    if (!username.trim() || !password) {
      throw new AppError(errorCodes.validation, errorMessages.validation)
    }

    // TODO: Replace mock with real endpoint call once the API is available.
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))

    return {
      id: "usr_001",
      name: "Alex Morgan",
      username: username.trim(),
    }
  }, "auth.signIn")
}

export async function signUp(
  name: string,
  username: string,
  email: string,
  password: string
): Promise<AuthUser> {
  return assertAsync(async () => {
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      throw new AppError(errorCodes.validation, errorMessages.validation)
    }

    // TODO: Replace mock with real endpoint call once the API is available.
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))

    return {
      id: "usr_002",
      name: name.trim(),
      username: username.trim(),
    }
  }, "auth.signUp")
}
