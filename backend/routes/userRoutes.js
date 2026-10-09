const express = require('express');
const router = express.Router();
const { createUser, getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('admin'), createUser);
router.get('/', protect, authorize('admin'), getUsers);

module.exports = router;