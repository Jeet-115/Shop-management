import Item from "../models/Item.js";
import Category from "../models/Category.js";

// @desc    Get all items (optionally by category)
// @route   GET /api/items?categoryId=123
// @access  Public
export const getItems = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = categoryId ? { category: categoryId } : {};
    const items = await Item.find(filter).populate("category", "name");

    // Ensure session.quantities exists
    if (!req.session.quantities) {
      req.session.quantities = {};
    }

    // Merge session-based quantities
    const merged = items.map((item) => ({
      ...item.toObject(),
      quantity: req.session.quantities[item._id] || 0,
    }));

    res.json(merged);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create item in category (Admin)
// @route   POST /api/items
// @access  Private (Admin)
export const createItem = async (req, res) => {
  try {
    const { categoryId, name, quantity } = req.body;

    if (!categoryId || !name) {
      return res
        .status(400)
        .json({ message: "Category ID and Item name are required" });
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    const item = new Item({
      category: categoryId,
      name,
      quantity: quantity || 0,
    });

    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update item quantity (Admin or Normal User)
// @route   PATCH /api/items/:id/quantity
// @access  Private
export const updateItemQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity == null) {
      return res.status(400).json({ message: "Quantity is required" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Initialize session quantities if not present
    if (!req.session.quantities) {
      req.session.quantities = {};
    }

    // Store quantity per-session instead of DB
    req.session.quantities[item._id] = quantity;

    res.json({
      ...item.toObject(),
      quantity: req.session.quantities[item._id],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete item (Admin)
// @route   DELETE /api/items/:id
// @access  Private (Admin)
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.deleteOne();
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update item name (Admin or authorized user)
// @route   PATCH /api/items/:id
// @access  Private (Admin or authorized)
export const updateItemName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.name = name.trim();
    const updatedItem = await item.save();

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
