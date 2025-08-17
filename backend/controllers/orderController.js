import Category from "../models/Category.js";
import Item from "../models/Item.js";
import Order from "../models/Order.js";
import sendEmail from "../utils/sendEmail.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

// @desc    Get categories with items having quantity > 0
// @route   GET /api/orders/items
// @access  Public
export const getAvailableItemsForOrder = async (req, res) => {
  try {
    const items = await Item.find(); // base items
    const sessionQuantities = req.session.items || {};

    const availableItems = items
      .filter((item) => (sessionQuantities[item._id] || 0) > 0)
      .map((item) => ({
        ...item.toObject(),
        quantity: sessionQuantities[item._id] || 0,
      }));

    res.json(availableItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Place order based on session quantities
// @route   POST /api/orders
// @access  Public
export const placeOrder = async (req, res) => {
  try {
    const { email, message } = req.body;
    const sessionQuantities = req.session.items || {}; // FIXED ✅

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Get item IDs with quantity > 0
    const itemIds = Object.keys(sessionQuantities).filter(
      (id) => sessionQuantities[id] > 0
    );

    if (itemIds.length === 0) {
      return res
        .status(400)
        .json({ message: "No items selected for the order" });
    }

    // Fetch items from DB
    const items = await Item.find({ _id: { $in: itemIds } });

    // Build order items array
    const orderItems = items.map((item) => ({
      category: item.category,
      name: item.name,
      quantity: sessionQuantities[item._id.toString()],
    }));

    // Save order in DB
    const newOrder = await Order.create({ email, message, items: orderItems });

    const now = new Date();
    const timestamp = now.toLocaleString();

    // Generate Excel in memory
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Order Summary");
    worksheet.mergeCells("A1:C1");
    worksheet.getCell("A1").value = "SANT CORPORATION";
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("A1").font = {
      size: 16,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0D47A1" },
    };

    // 🔹 Merge cells for title row
    worksheet.mergeCells("A2:C2");
    worksheet.getCell("A2").value = `Order Summary – ${timestamp}`;
    worksheet.getCell("A2").alignment = { horizontal: "center" };
    worksheet.getCell("A2").font = {
      size: 12,
      bold: true,
      color: { argb: "FF000000" },
    };

    // 🔹 Table headers
    worksheet.getRow(3).values = ["Category", "Item", "Quantity"];
    worksheet.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(3).alignment = { horizontal: "center" };
    worksheet.getRow(3).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1976D2" },
    };

    // 🔹 Set column widths
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
        worksheet.getRow(rowNumber).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F6FA" },
        };
      }
    });

    // 🔹 Add borders to all cells
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

    const excelBuffer = await workbook.xlsx.writeBuffer();

    const pdfDoc = new PDFDocument({ size: "A4", margin: 40 });
    const buffers = [];
    pdfDoc.on("data", (chunk) => buffers.push(chunk));
    pdfDoc.on("error", (err) => {
      console.error("PDF generation error:", err);
    });

    // Header: Brand
    pdfDoc
      .registerFont("Regular", "Helvetica") // optional, ensure font available
      .registerFont("Bold", "Helvetica-Bold");

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
      .text(`Order Summary — ${timestamp}`, { align: "center" });

    pdfDoc.moveDown(1);

    // Table placement
    const left = pdfDoc.page.margins.left; // 40
    const pageWidth =
      pdfDoc.page.width - pdfDoc.page.margins.left - pdfDoc.page.margins.right;
    const tableWidth = Math.min(520, pageWidth); // keep inside margins
    const headerHeight = 26;
    const rowHeight = 20;

    // column X positions (adjust widths as needed)
    const col1X = left + 0; // Category
    const col2X = left + 200; // Item
    const col3X = left + tableWidth - 60; // Quantity (right aligned)

    // Draw table header background
    const tableTop = pdfDoc.y;
    pdfDoc.rect(left, tableTop, tableWidth, headerHeight).fill("#1976D2");

    // Header text (white)
    pdfDoc
      .fillColor("white")
      .font("Bold")
      .fontSize(11)
      .text("Category", col1X + 8, tableTop + 7, { width: 180 })
      .text("Item", col2X + 8, tableTop + 7, { width: col3X - col2X - 8 })
      .text("Quantity", col3X, tableTop + 7, { width: 56, align: "right" });

    // Move cursor down beneath header
    let currentY = tableTop + headerHeight + 6;

    // Reset text color for rows
    pdfDoc.fillColor("#333").font("Regular").fontSize(10);

    // If no items, show a helpful note
    if (!items || items.length === 0) {
      pdfDoc.text("No items in this order.", left + 8, currentY);
      currentY += rowHeight;
    } else {
      // Rows
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Page break check: if row would go beyond bottom margin, add new page and redraw header
        const bottomLimit =
          pdfDoc.page.height - pdfDoc.page.margins.bottom - 40; // keep some footer space
        if (currentY + rowHeight > bottomLimit) {
          pdfDoc.addPage();
          // redraw header on new page
          const newTableTop = pdfDoc.y;
          pdfDoc
            .rect(left, newTableTop, tableWidth, headerHeight)
            .fill("#1976D2");
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

        // Alternating row background (subtle)
        if (i % 2 === 0) {
          pdfDoc
            .rect(left, currentY - 4, tableWidth, rowHeight)
            .fill("#F3F6FA");
          pdfDoc.fillColor("#333"); // reset text color
        }

        // Write the row text (use absolute coordinates)
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

    // Footer / timestamp
    pdfDoc.moveTo(left, currentY + 10);
    pdfDoc
      .fontSize(9)
      .fillColor("#666")
      .text(`Generated: ${timestamp}`, left, currentY + 12);

    // Finalize PDF
    pdfDoc.end();

    // Wait for PDF to finish and build buffer
    await new Promise((resolve, reject) => {
      pdfDoc.on("end", resolve);
      pdfDoc.on("error", reject);
    });
    const pdfBuffer = Buffer.concat(buffers);

    await sendEmail({
      to: email,
      subject: "Purchase Order Request – SANT CORPORATION",
      text: `
Dear Supplier,

We are writing to place an order for the items listed in the attached documents.

${message ? `Message from SANT CORPORATION:\n${message}\n` : ""}

The details of our order are provided in the attached PDF and Excel files, organized by category for your reference.

Please review the order and confirm availability at your earliest convenience.

Thank you,
SANT CORPORATION
Email: support@santcorporation.com
Phone: +1 (555) 123-4567
`,
      html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Purchase Order Request</title>
  </head>
  <body style="font-family: Arial, sans-serif; background: #f5f7fa; padding: 20px; color: #333;">
    <table width="100%" cellpadding="0" cellspacing="0" 
      style="max-width: 600px; margin: auto; background: white; border-radius: 6px; 
      overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      
      <tr>
        <td style="background: #0d47a1; padding: 20px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
          SANT CORPORATION
        </td>
      </tr>

      <tr>
        <td style="padding: 30px; font-size: 15px; line-height: 1.6;">
          <p>Dear Supplier,</p>
          <p>We are writing to place an order for the items listed in the attached documents.</p>

          ${
            message
              ? `<p style="background: #f3f6fa; padding: 10px; border-left: 4px solid #0d47a1; margin: 20px 0;">
                  <strong>Message from SANT CORPORATION:</strong><br/>${message}
                 </p>`
              : ""
          }

          <p>The details of our order are provided in the attached <strong>PDF</strong> and <strong>Excel</strong> files, 
          organized by category for your reference.</p>

          <p>Please review the order and confirm availability at your earliest convenience.</p>

          <p>Thank you,<br/>
          <strong>SANT CORPORATION</strong><br/>
          Email: support@santcorporation.com<br/>
          Phone: +1 (555) 123-4567</p>
        </td>
      </tr>

      <tr>
        <td style="background: #f0f0f0; text-align: center; padding: 15px; font-size: 12px; color: #777;">
          © ${new Date().getFullYear()} SANT CORPORATION. All rights reserved.<br/>
          This email was sent to ${email}.
        </td>
      </tr>
    </table>
  </body>
</html>
`,
      attachments: [
        { filename: "order.xlsx", content: excelBuffer },
        { filename: "order.pdf", content: pdfBuffer },
      ],
    });

    res.json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
};

export const resetAllItemQuantities = async (req, res) => {
  try {
    // Clear session items
    req.session.items = {};

    res.json({ message: "All session item quantities reset to 0" });
  } catch (error) {
    console.error("Error resetting session quantities:", error);
    res.status(500).json({ message: "Failed to reset session item quantities" });
  }
};

// @desc    Fetch all orders (for admin)
// @route   GET /api/orders
// @access  Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
