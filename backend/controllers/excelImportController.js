// controllers/excelImportController.js
import ExcelJS from "exceljs";
import Category from "../models/Category.js";
import Item from "../models/Item.js";

export const importFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.worksheets[0];

    const categoriesData = [];

    for (let col = 1; col <= sheet.columnCount; col += 2) {
      let currentCategory = null;

      for (let row = 2; row <= sheet.rowCount; row++) {
        const itemCell = sheet.getRow(row).getCell(col);
        const qtyCell = sheet.getRow(row).getCell(col + 1);

        const itemValue = itemCell.value ? String(itemCell.value).trim() : "";
        const qtyValue = qtyCell.value ? Number(qtyCell.value) : 0;

        const isHeader = ["ITEMS NAME", "QTY"].includes(itemValue.toUpperCase());

        // Detect if cell has any fill color at all (excluding null)
        const hasFill =
          itemCell.fill &&
          itemCell.fill.fgColor &&
          (itemCell.fill.fgColor.argb || itemCell.fill.fgColor.theme !== undefined);

        if (!itemValue || isHeader) {
          continue; // Don't reset category here, just skip
        }

        if (hasFill) {
          // New category
          const cleanName = itemValue.replace(/\s+/g, " ").trim();
          currentCategory = { name: cleanName, items: [] };
          categoriesData.push(currentCategory);
          continue;
        }

        if (currentCategory) {
          currentCategory.items.push({
            name: itemValue,
            qty: isNaN(qtyValue) ? 0 : qtyValue,
          });
        } else {
          // This is an orphaned item with no detected category
          console.warn(`Orphan item found: "${itemValue}" (row ${row}, col ${col})`);
        }
      }
    }

    // Save to DB
    const categoryMap = {};
    for (const cat of categoriesData) {
      if (!categoryMap[cat.name]) {
        let category = await Category.findOne({ name: cat.name });
        if (!category) {
          category = await Category.create({ name: cat.name });
        }
        categoryMap[cat.name] = category._id;
      }

      for (const item of cat.items) {
        const exists = await Item.findOne({
          name: item.name,
          category: categoryMap[cat.name],
        });
        if (!exists) {
          await Item.create({
            name: item.name,
            quantity: item.qty,
            category: categoryMap[cat.name],
          });
        }
      }
    }

    res.json({ message: "Excel data imported successfully" });
  } catch (error) {
    console.error("Excel Import Error:", error);
    res.status(500).json({ message: error.message });
  }
};
