import { createRoot } from "react-dom/client"
import { toPng } from "html-to-image"
import { jsPDF } from "jspdf"

import { PageContent } from "@/document-engine/PageContent"
import type { DocDocument } from "@/document-engine/types"

export async function exportDocumentToPdf(
  doc: DocDocument,
  fileName: string
): Promise<void> {
  const host = document.createElement("div")
  host.style.position = "fixed"
  host.style.left = "-10000px"
  host.style.top = "0"
  host.setAttribute("aria-hidden", "true")
  document.body.appendChild(host)

  const root = createRoot(host)
  root.render(
    <div>
      {doc.pages.map((page, index) => (
        <div
          key={page.id}
          data-doc-page={index}
          style={{
            width: page.width,
            height: page.height,
            overflow: "hidden",
          }}
        >
          <PageContent doc={doc} page={page} pageIndex={index} />
        </div>
      ))}
    </div>
  )

  try {
    await new Promise((resolve) => setTimeout(resolve, 120))
    await document.fonts?.ready

    let pdf: jsPDF | null = null
    const nodes = host.querySelectorAll<HTMLElement>("[data-doc-page]")
    for (let index = 0; index < doc.pages.length; index += 1) {
      const node = nodes[index]
      if (!node) continue
      const page = doc.pages[index]
      const widthPt = page.width * 0.75
      const heightPt = page.height * 0.75
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: page.background || "#ffffff",
        cacheBust: true,
      })
      if (!pdf) {
        pdf = new jsPDF({
          orientation: page.orientation,
          unit: "pt",
          format: [widthPt, heightPt],
        })
      } else {
        pdf.addPage([widthPt, heightPt], page.orientation)
      }
      pdf.addImage(dataUrl, "PNG", 0, 0, widthPt, heightPt)
    }
    pdf?.save(fileName)
  } finally {
    root.unmount()
    host.remove()
  }
}
