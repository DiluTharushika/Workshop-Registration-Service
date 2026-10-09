const express = require('express');
const router = express.Router();
const {
  registerAttendee,
  cancelRegistration,
  getRegistrations,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('manager', 'staff'), getRegistrations);
router.post('/', protect, authorize('manager', 'staff'), registerAttendee);
router.patch('/:id/cancel', protect, authorize('manager', 'staff'), cancelRegistration);

module.exports = router;