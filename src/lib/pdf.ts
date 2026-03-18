/**
 * PDF export helper using pdf-lib.
 * Generates a signed agreement PDF and returns the bytes.
 */
import { PDFDocument, StandardFonts, rgb, PageSizes } from "pdf-lib";
import type { Agreement } from "./types";

export async function buildAgreementPdf(agreement: Agreement): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage(PageSizes.Letter);
  const { width, height } = page.getSize();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 60;
  let y = height - margin;

  const drawText = (
    text: string,
    x: number,
    yPos: number,
    size: number,
    bold = false,
    color = rgb(0, 0, 0)
  ) => {
    page.drawText(text, {
      x,
      y: yPos,
      size,
      font: bold ? helveticaBold : helvetica,
      color,
    });
  };

  // Header
  drawText(agreement.firmName, margin, y, 18, true, rgb(0.1, 0.3, 0.6));
  y -= 24;
  drawText("TAX PREPARATION AGREEMENT", margin, y, 14, true);
  y -= 18;
  drawText(`Tax Year: ${agreement.taxYear}`, margin, y, 10);
  y -= 14;

  // Horizontal rule
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.6, 0.6, 0.6),
  });
  y -= 20;

  // Parties
  drawText("CLIENT INFORMATION", margin, y, 11, true);
  y -= 16;
  drawText(`Name:  ${agreement.clientName}`, margin + 12, y, 10);
  y -= 14;
  drawText(`Phone: ${agreement.clientPhone}`, margin + 12, y, 10);
  y -= 14;
  if (agreement.clientEmail) {
    drawText(`Email: ${agreement.clientEmail}`, margin + 12, y, 10);
    y -= 14;
  }
  y -= 10;

  drawText("PREPARER INFORMATION", margin, y, 11, true);
  y -= 16;
  drawText(`Preparer: ${agreement.preparerName}`, margin + 12, y, 10);
  y -= 14;
  drawText(`Firm:     ${agreement.firmName}`, margin + 12, y, 10);
  y -= 24;

  // Agreement body
  drawText("AGREEMENT TERMS", margin, y, 11, true);
  y -= 16;

  // Word-wrap the agreement text
  const words = agreement.agreementText.split(" ");
  const lineWidth = width - 2 * margin - 12;
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    const testWidth = helvetica.widthOfTextAtSize(test, 9);
    if (testWidth > lineWidth && line) {
      drawText(line, margin + 12, y, 9);
      y -= 13;
      line = word;
      if (y < margin + 100) {
        // Overflow guard: stop rendering body text before signature area
        drawText("[…continued on signed document…]", margin + 12, y, 9);
        y -= 13;
        break;
      }
    } else {
      line = test;
    }
  }
  if (line) {
    drawText(line, margin + 12, y, 9);
    y -= 13;
  }

  y -= 20;

  // Signature block
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.5,
    color: rgb(0.6, 0.6, 0.6),
  });
  y -= 20;

  drawText("SIGNATURE", margin, y, 11, true);
  y -= 16;

  if (agreement.signatureDataUrl && agreement.signatureDataUrl.startsWith("data:image/png;base64,")) {
    try {
      const base64 = agreement.signatureDataUrl.replace("data:image/png;base64,", "");
      const imgBytes = Buffer.from(base64, "base64");
      const sigImage = await pdfDoc.embedPng(imgBytes);
      const sigDims = sigImage.scale(0.5);
      page.drawImage(sigImage, {
        x: margin + 12,
        y: y - sigDims.height,
        width: Math.min(sigDims.width, 200),
        height: Math.min(sigDims.height, 60),
      });
      y -= Math.min(sigDims.height, 60) + 12;
    } catch {
      drawText("[ Signature on file ]", margin + 12, y, 10);
      y -= 16;
    }
  } else {
    drawText("[ Signature on file ]", margin + 12, y, 10);
    y -= 16;
  }

  drawText(`Signed At: ${agreement.signedAt ?? "N/A"}`, margin + 12, y, 9, false, rgb(0.4, 0.4, 0.4));
  y -= 13;
  drawText(`IP Address: ${agreement.ipAddress ?? "N/A"}`, margin + 12, y, 9, false, rgb(0.4, 0.4, 0.4));
  y -= 13;
  drawText(`Agreement ID: ${agreement.id}`, margin + 12, y, 8, false, rgb(0.5, 0.5, 0.5));
  y -= 11;
  drawText(`Token: ${agreement.token}`, margin + 12, y, 8, false, rgb(0.5, 0.5, 0.5));

  // Footer
  page.drawText(
    "This document was electronically signed via RTPS e-sign platform.",
    {
      x: margin,
      y: margin - 10,
      size: 8,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
    }
  );

  return pdfDoc.save();
}
