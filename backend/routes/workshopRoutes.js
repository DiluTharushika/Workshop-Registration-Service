const express = require('express');
const router = express.Router();
const {
  createWorkshop,
  getWorkshops,
  getWorkshopById,
  updateWorkshop,
  joinWaitlist,
  leaveWaitlist,
} = require('../controllers/workshopController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// View
router.get('/',    protect, authorize('admin', 'manager', 'staff'), getWorkshops);
router.get('/:id', protect, authorize('admin', 'manager', 'staff'), getWorkshopById);

// Create / Edit — Admin + Manager
router.post('/',    protect, authorize('admin', 'manager'), createWorkshop);
router.put('/:id',  protect, authorize('admin', 'manager'), updateWorkshop);

// Waitlist — Manager + Staff
router.post(  '/:id/waitlist',         protect, authorize('admin', 'manager', 'staff'), joinWaitlist);
router.delete('/:id/waitlist/:entryId',protect, authorize('admin', 'manager', 'staff'), leaveWaitlist);

module.exports = router;