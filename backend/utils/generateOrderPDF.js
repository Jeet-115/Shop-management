import PDFDocument from "pdfkit";

/**
 * Generates a PDF buffer for an order summary.
 * @param {Array} items - List of items with { category, name, quantity }.
 * @param {String} timestamp - Timestamp to display in PDF.
 * @param {String} [title='Order Summary'] - Optional custom title.
 * @returns {Promise<Buffer>} - The generated PDF buffer.
 */
const generateOrderPDF = (items, timestamp, title = "Order Summary") => {
  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers = [];

      pdfDoc.on("data", (chunk) => buffers.push(chunk));
      pdfDoc.on("error", (err) => reject(err));

      // ✅ Register fonts (system defaults)
      pdfDoc.registerFont("Regular", "Helvetica");
      pdfDoc.registerFont("Bold", "Helvetica-Bold");

      // ✅ Header
      pdfDoc
        .font("Bold")
        .fontSize(18)
        .fillColor("#0D47A1")
        .text("SANT CORPORATION", { align: "center" });

      pdfDoc.moveDown(0.4);
      pdfDoc
        .font("Regular")
        .fontSize(12)
        .fillColor("#333")
        .text(`${title} — ${timestamp}`, { align: "center" });
      pdfDoc.moveDown(1);

      // ✅ Table Layout Setup
      const left = pdfDoc.page.margins.left;
      const pageWidth =
        pdfDoc.page.width - pdfDoc.page.margins.left - pdfDoc.page.margins.right;
      const tableWidth = Math.min(520, pageWidth);
      const headerHeight = 26;
      const rowHeight = 20;

      const col1X = left + 0;
      const col2X = left + 200;
      const col3X = left + tableWidth - 60;

      const tableTop = pdfDoc.y;
      pdfDoc.rect(left, tableTop, tableWidth, headerHeight).fill("#1976D2");

      pdfDoc
        .fillColor("white")
        .font("Bold")
        .fontSize(11)
        .text("Category", col1X + 8, tableTop + 7, { width: 180 })
        .text("Item", col2X + 8, tableTop + 7, { width: col3X - col2X - 8 })
        .text("Quantity", col3X, tableTop + 7, { width: 56, align: "right" });

      let currentY = tableTop + headerHeight + 6;
      pdfDoc.fillColor("#333").font("Regular").fontSize(10);

      // ✅ Handle Empty Items
      if (!items || items.length === 0) {
        pdfDoc.text("No items in this order.", left + 8, currentY);
        currentY += rowHeight;
      } else {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const bottomLimit =
            pdfDoc.page.height - pdfDoc.page.margins.bottom - 40;

          // Page break
          if (currentY + rowHeight > bottomLimit) {
            pdfDoc.addPage();
            const newTableTop = pdfDoc.y;
            pdfDoc.rect(left, newTableTop, tableWidth, headerHeight).fill("#1976D2");
            pdfDoc
              .fillColor("white")
              .font("Bold")
              .fontSize(11)
              .text("Category", col1X + 8, newTableTop + 7, { width: 180 })
              .text("Item", col2X + 8, newTableTop + 7, {
                width: col3X - col2X - 8,
              })
              .text("Quantity", col3X, newTableTop + 7, {
                width: 56,
                align: "right",
              });
            currentY = newTableTop + headerHeight + 6;
            pdfDoc.fillColor("#333").font("Regular").fontSize(10);
          }

          // Alternating background
          if (i % 2 === 0) {
            pdfDoc.rect(left, currentY - 4, tableWidth, rowHeight).fill("#F3F6FA");
            pdfDoc.fillColor("#333");
          }

          // Row text
          pdfDoc.text(item.category || "-", col1X + 8, currentY, { width: 180 });
          pdfDoc.text(item.name || "-", col2X + 8, currentY, {
            width: col3X - col2X - 8,
          });
          pdfDoc.text(String(item.quantity ?? "-"), col3X, currentY, {
            width: 56,
            align: "right",
          });

          currentY += rowHeight;
        }
      }

      // ✅ Footer
      pdfDoc.moveTo(left, currentY + 10);
      pdfDoc
        .fontSize(9)
        .fillColor("#666")
        .text(`Generated: ${timestamp}`, left, currentY + 12);

      pdfDoc.end();

      pdfDoc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default generateOrderPDF;
