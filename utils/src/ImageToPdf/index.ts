import { PDFDocument } from "pdf-lib";
export async function imagesToPdf(
  images: any[],
  { width, height } = {
    width: 800,
    height: 800 * 1.414,
  },
) {
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error("图片列表不能为空");
  }

  const pdfDoc = await PDFDocument.create();

  for (let img of images) {
    let buffer;

    if (img instanceof File || img instanceof Blob) {
      buffer = await img.arrayBuffer();
    } else if (typeof img === "string") {
      const res = await fetch(img);
      buffer = await res.arrayBuffer();
    } else {
      throw new Error("图片格式不支持");
    }

    // 判断格式
    const bytes = new Uint8Array(buffer);
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;

    const image = isPng ? await pdfDoc.embedPng(buffer) : await pdfDoc.embedJpg(buffer);

    const imgWidth = image.width;
    const imgHeight = image.height;

    const scale = Math.min(width / imgWidth, height / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;

    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}
