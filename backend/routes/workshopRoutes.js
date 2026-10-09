const express = require('express');
const router = express.Router();
const {
  createWorkshop,
  getWorkshops,
  getWorkshopById,
  updateWorkshop,
} = require('../controllers/workshopController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Admin + Manager + Staff can view
router.get('/', protect, authorize('admin', 'manager', 'staff'), getWorkshops);
router.get('/:id', protect, authorize('admin', 'manager', 'staff'), getWorkshopById);

// Admin + Manager can create/edit
router.post('/', protect, authorize('admin', 'manager'), createWorkshop);
router.put('/:id', protect, authorize('admin', 'manager'), updateWorkshop);

module.exports = router;