const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs (paginated, filterable)
// @route   GET /api/audit
// @access  Admin, Manager
const getAuditLogs = async (req, res) => {
  try {
    const { targetType, action, limit = 100, page = 1 } = req.query;
    const query = {};
    if (targetType) query.targetType = targetType;
    if (action)     query.action     = { $regex: action, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('performedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(query),
    ]);

    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAuditLogs };
