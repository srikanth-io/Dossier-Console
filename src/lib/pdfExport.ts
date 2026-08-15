import { toPng } from "html-to-image"
import { jsPDF } from "jspdf"

import { RESUME_PREVIEW_CLASSES } from "@/lib/latexPreview"

const PAGE_WIDTH_PT = 595.28
const PAGE_HEIGHT_PT = 841.89
const PREVIEW_WIDTH_PX = 595
const PREVIEW_PADDING_PX = 32

async function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  const img = new Image()
  img.src = dataUrl
  await img.decode()
  return img
}

/**
 * Renders the LaTeX preview HTML exactly as shown on screen and exports it as
 * a multi-page A4 PDF. Content longer than a single page is split across pages.
 */
export async function exportPreviewToPdf(
  previewHtml: string,
  fileName = "resume.pdf"
): Promise<void> {
  const host = document.createElement("div")
  host.style.position = "fixed"
  host.style.left = "-10000px"
  host.style.top = "0"
  host.style.width = `${PREVIEW_WIDTH_PX}px`
  host.setAttribute("aria-hidden", "true")

  const page = document.createElement("div")
  page.style.backgroundColor = "#ffffff"
  page.style.padding = `${PREVIEW_PADDING_PX}px`
  page.innerHTML = `<div class="${RESUME_PREVIEW_CLASSES}" style="color:#09090b">${previewHtml}</div>`

  host.appendChild(page)
  document.body.appendChild(host)

  try {
    await document.fonts?.ready
    const dataUrl = await toPng(page, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    })

    const img = await loadImage(dataUrl)
    const aspect = img.height / img.width
    const targetWidth = PAGE_WIDTH_PT
    const targetHeight = targetWidth * aspect
    const pageCount = Math.max(1, Math.ceil(targetHeight / PAGE_HEIGHT_PT))

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
    for (let index = 0; index < pageCount; index += 1) {
      if (index > 0) pdf.addPage("a4", "portrait")
      pdf.addImage(dataUrl, "PNG", 0, -index * PAGE_HEIGHT_PT, targetWidth, targetHeight)
    }
    pdf.save(fileName)
  } finally {
    host.remove()
  }
}
