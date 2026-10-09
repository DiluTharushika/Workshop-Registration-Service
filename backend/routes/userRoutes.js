const express = require('express');
const router = express.Router();
const { createUser, getUsers, updateUserRole } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.get('/',             protect, authorize('admin'), getUsers);
router.post('/',            protect, authorize('admin'), createUser);
router.patch('/:id/role',   protect, authorize('admin'), updateUserRole);

module.exports = router;