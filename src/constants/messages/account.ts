export const account = {
  blockedTitle: "Account access restricted",
  blockedFallback:
    "This account cannot be accessed right now. Contact your administrator if you believe this is a mistake.",
  signOut: "Sign out",
  states: {
    UNVERIFIED: {
      title: "Verify your email",
      description:
        "Your email address has not been verified yet. Check your inbox for the confirmation link, then try signing in again.",
    },
    LOCKED: {
      title: "Account locked",
      description:
        "This account has been locked following multiple failed attempts or a security review. Contact your administrator to regain access.",
    },
    SUSPENDED: {
      title: "Account suspended",
      description:
        "This account is suspended and cannot be used at the moment. Contact your administrator for more information.",
    },
    DISABLED: {
      title: "Account disabled",
      description:
        "This account has been disabled. If you believe this was done in error, contact your administrator.",
    },
    DELETED: {
      title: "Account unavailable",
      description: "This account no longer exists.",
    },
  },
} as const
