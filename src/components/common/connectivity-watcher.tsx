import { useEffect } from "react"
import { toast } from "sonner"

import { commonMessages } from "@/constants/messages/common"
import { flushQueue } from "@/lib/mutation-queue"

/**
 * Global connectivity watcher: toasts on disconnect/reconnect and replays any
 * mutations that were queued while offline. Mount once, near the app root.
 */
export function ConnectivityWatcher() {
  useEffect(() => {
    const handleOffline = () => {
      toast.error(commonMessages.networkLost, {
        description: commonMessages.networkLostHint,
        duration: 6000,
      })
    }

    const handleOnline = () => {
      toast.success(commonMessages.networkRestored)
      void flushQueue().then((applied) => {
        if (applied > 0) {
          toast.success(commonMessages.offlineSynced(applied))
        }
      })
    }

    // Catch queued work from a previous offline session.
    void flushQueue()

    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)
    return () => {
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  return null
}
