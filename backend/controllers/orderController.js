import Category from "../models/Category.js";
import Item from "../models/Item.js";
import Order from "../models/Order.js";
import sendEmail from "../utils/sendEmail.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import generateOrderPDF from "../utils/generateOrderPDF.js";
import generateOrderExcel from "../utils/generateOrderExcel.js";

// @desc    Get categories with items having quantity > 0
// @route   GET /api/orders/items
// @access  Public
export const getAvailableItemsForOrder = async (req, res) => {
  try {
    // Find all items with quantity > 0, and populate category
    const items = await Item.find({ quantity: { $gt: 0 } })
      .populate("category", "name")
      .sort({ "category.name": 1, name: 1 });

    // Group items by category
    const categoryMap = {};
    items.forEach((item) => {
      const catName = item.category?.name || "Uncategorized";
      if (!categoryMap[catName]) {
        categoryMap[catName] = [];
      }
      categoryMap[catName].push({
        id: item._id,
        name: item.name,
        quantity: item.quantity,
      });
    });

    // Transform into array
    const result = Object.keys(categoryMap).map((catName) => ({
      category: catName,
      items: categoryMap[catName],
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching available items:", error);
    res.status(500).json({ message: error.message });
  }
};

export const placeOrder = async (req, res) => {
  try {
    const { email, message, items } = req.body;

    if (!email || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // Save order to DB
    const newOrder = await Order.create({ email, message, items, status: "pending" });

    res.json({
      message: "Order submitted for admin verification.",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Failed to submit order" });
  }
};

export const verifyAndSendOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "sent") {
      return res.status(400).json({ message: "Order already sent" });
    }

    const now = new Date();
    const timestamp = now.toLocaleString();

    const excelBuffer = await generateOrderExcel(order.items, timestamp);

    const pdfBuffer = await generateOrderPDF(order.items, timestamp, "Order Summary");

    // Send email using admin email as sender
    await sendEmail({
      to: order.email,
      subject: "Purchase Order Request – SANT CORPORATION",
      text: `
Dear Supplier,

We are writing to place an order for the items listed in the attached documents.

${order.message ? `Message from SANT CORPORATION:\n${order.message}\n` : ""}

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
            order.message
              ? `<p style="background: #f3f6fa; padding: 10px; border-left: 4px solid #0d47a1; margin: 20px 0;">
                  <strong>Message from SANT CORPORATION:</strong><br/>${order.message}
                 </p>`
              : ""
          }

          <p>The details of our order are provided in the attached <strong>PDF</strong> and <strong>Excel</strong> files, 
          organized by category for your reference.</p>

          <p>Please review the order and confirm availability at your earliest convenience.</p>

          <p>Thank you,<br/>
          <strong>SANT CORPORATION</strong><br/>
          Email: Jireshpatel@yahoo.com <br/>
          Phone: +17577751300 </p>
        </td>
      </tr>

      <tr>
        <td style="background: #f0f0f0; text-align: center; padding: 15px; font-size: 12px; color: #777;">
          © ${new Date().getFullYear()} SANT CORPORATION. All rights reserved.<br/>
          This email was sent to ${order.email}.
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

    // Update order status
    order.status = "sent";
    order.verifiedBy = process.env.ADMIN_EMAIL || "admin@sant.com"; // set your admin email from env
    order.sentAt = now;
    await order.save();

    res.json({ message: "Order verified and sent successfully", order });
  } catch (error) {
    console.error("Error verifying/sending order:", error);
    res.status(500).json({ message: "Failed to verify/send order" });
  }
};


export const resetAllItemQuantities = async (req, res) => {
  try {
    await Item.updateMany({}, { $set: { quantity: 0 } });
    res.json({ message: "All item quantities reset to 0" });
  } catch (error) {
    console.error("Error resetting quantities:", error);
    res.status(500).json({ message: "Failed to reset item quantities" });
  }
};

// @desc    Fetch all orders (for admin)
// @route   GET /api/orders
// @access  Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 }) // latest first
      .lean();

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
