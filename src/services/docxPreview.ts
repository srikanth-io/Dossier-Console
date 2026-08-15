import DOMPurify from "dompurify"
import mammoth from "mammoth"

import { safeAsync } from "@/lib/async"

export async function docxToHtml(fileUrl: string): Promise<string | null> {
  return safeAsync(async () => {
    const response = await fetch(fileUrl)
    const arrayBuffer = await response.arrayBuffer()
    const result = await mammoth.convertToHtml({ arrayBuffer })
    return DOMPurify.sanitize(result.value)
  }, { context: "docxToHtml" })
}
