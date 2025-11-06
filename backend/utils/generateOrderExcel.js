import ExcelJS from "exceljs";

/**
 * Generates an Excel buffer for an order summary.
 * @param {Array} items - List of items with { category, name, quantity }.
 * @param {String} timestamp - Timestamp to display in Excel.
 * @param {String} [title='Order Summary'] - Optional custom title.
 * @returns {Promise<Buffer>} - The generated Excel buffer.
 */
const generateOrderExcel = async (items, timestamp, title = "Order Summary") => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Order Summary");

  // 🔹 Title row
  worksheet.mergeCells("A1:C1");
  worksheet.getCell("A1").value = "SANT CORPORATION";
  worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getCell("A1").font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D47A1" } };

  // 🔹 Timestamp row
  worksheet.mergeCells("A2:C2");
  worksheet.getCell("A2").value = `${title} – ${timestamp}`;
  worksheet.getCell("A2").alignment = { horizontal: "center" };
  worksheet.getCell("A2").font = { size: 12, bold: true, color: { argb: "FF000000" } };

  // 🔹 Table headers
  worksheet.getRow(3).values = ["Category", "Item", "Quantity"];
  worksheet.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(3).alignment = { horizontal: "center" };
  worksheet.getRow(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1976D2" } };

  // 🔹 Column widths
  worksheet.columns = [
    { key: "category", width: 20 },
    { key: "name", width: 30 },
    { key: "quantity", width: 12 },
  ];

  // 🔹 Add rows
  items.forEach((item, index) => {
    const rowNumber = index + 4;
    worksheet.addRow(item);

    // Alternating row colors
    if (rowNumber % 2 === 0) {
      worksheet.getRow(rowNumber).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F6FA" } };
    }
  });

  // 🔹 Add borders
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFB0B0B0" } },
        left: { style: "thin", color: { argb: "FFB0B0B0" } },
        bottom: { style: "thin", color: { argb: "FFB0B0B0" } },
        right: { style: "thin", color: { argb: "FFB0B0B0" } },
      };
    });
  });

  // 🔹 Return buffer
  return workbook.xlsx.writeBuffer();
};

export default generateOrderExcel;
