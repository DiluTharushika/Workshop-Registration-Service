const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const audit = (action, performedBy, targetId, targetLabel, changes = {}, meta = {}) =>
  AuditLog.create({ action, performedBy, targetType: 'User', targetId, targetLabel, changes, meta })
    .catch((e) => console.error('Audit log failed:', e));

// @desc    Create a new user
// @route   POST /api/users
// @access  Admin only
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide name, email, password, and role' });
    }
    if (!['admin', 'manager', 'staff'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({ name, email, password, role });

    await audit('USER_CREATED', req.user._id, user._id, user.name, {}, { role, email });

    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Admin only
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a user's role
// @route   PATCH /api/users/:id/role
// @access  Admin only
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'manager', 'staff'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent self-demotion
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await audit('USER_ROLE_CHANGED', req.user._id, user._id, user.name, {
      role: { from: oldRole, to: role },
    });

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createUser, getUsers, updateUserRole };