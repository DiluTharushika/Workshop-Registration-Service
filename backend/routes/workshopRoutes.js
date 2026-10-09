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

// Manager + Staff can view
router.get('/', protect, authorize('manager', 'staff'), getWorkshops);
router.get('/:id', protect, authorize('manager', 'staff'), getWorkshopById);

// Manager only can create/edit
router.post('/', protect, authorize('manager'), createWorkshop);
router.put('/:id', protect, authorize('manager'), updateWorkshop);

module.exports = router;