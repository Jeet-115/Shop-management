import PayList from "../models/PayList.js";

// @desc    Get all pay list entries (excluding soft deleted)
// @route   GET /api/paylist
// @access  Public
export const getPayList = async (req, res) => {
  try {
    const payList = await PayList.find({ isDeleted: false }).sort({ date: -1 });
    res.json(payList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new pay list entry
// @route   POST /api/paylist
// @access  Private (Admin)
export const createPayList = async (req, res) => {
  try {
    const { date, checkNo, paidTo, amount } = req.body;

    if (!date || !checkNo || !paidTo || amount == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newEntry = new PayList({ date, checkNo, paidTo, amount });
    const savedEntry = await newEntry.save();

    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const togglePayListDelete = async (req, res) => {
  try {
    const entry = await PayList.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    entry.isDeleted = !entry.isDeleted;
    const updatedEntry = await entry.save();

    // Get latest total after toggle
    const result = await PayList.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalAmount = result[0]?.total || 0;

    res.json({
      message: "Entry updated successfully",
      updatedEntry,
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Delete pay list entry permanently
// @route   DELETE /api/paylist/:id
// @access  Private (Admin)
export const deletePayList = async (req, res) => {
  try {
    const entry = await PayList.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    await entry.deleteOne();
    res.json({ message: "Entry permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get total amount of non-deleted entries
// @route   GET /api/paylist/total
// @access  Public
export const getTotalAmount = async (req, res) => {
  try {
    const result = await PayList.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalAmount = result[0]?.total || 0;
    res.json({ totalAmount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};