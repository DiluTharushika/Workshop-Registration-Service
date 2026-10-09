const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Workshop = require('../models/Workshop');

// @desc    Register an attendee for a workshop
// @route   POST /api/registrations
// @access  Manager, Staff
const registerAttendee = async (req, res) => {
  try {
    const { workshopId, attendeeName, attendeeEmail } = req.body;

    if (!workshopId || !attendeeName || !attendeeEmail) {
      return res.status(400).json({ message: 'Please provide workshopId, attendeeName, and attendeeEmail' });
    }

    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({ message: 'Invalid workshop ID' });
    }

    // Check workshop exists and is active first (quick pre-check for better error message)
    const existingWorkshop = await Workshop.findById(workshopId);
    if (!existingWorkshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    if (existingWorkshop.status !== 'active') {
      return res.status(400).json({ message: 'Cannot register for a workshop that is not active' });
    }

    // 🔑 ATOMIC OPERATION: only increments bookedSeats if there is still room
    // This prevents overbooking even with simultaneous requests
    const workshop = await Workshop.findOneAndUpdate(
      {
        _id: workshopId,
        status: 'active',
        $expr: { $lt: ['$bookedSeats', '$capacity'] },
      },
      { $inc: { bookedSeats: 1 } },
      { new: true }
    );

    if (!workshop) {
      // Either seat was taken by someone else just now, or workshop became full
      return res.status(409).json({ message: 'Workshop is full. Registration rejected.' });
    }

    // Seat successfully reserved — now create the registration record
    try {
      const registration = await Registration.create({
        workshop: workshopId,
        attendeeName,
        attendeeEmail,
        status: 'active',
        registeredBy: req.user._id,
        registeredAt: new Date(),
      });

      const populatedRegistration = await registration.populate([
        { path: 'workshop', select: 'title code dateTime' },
        { path: 'registeredBy', select: 'name email role' },
      ]);

      return res.status(201).json(populatedRegistration);
    } catch (regError) {
      // Rollback the seat increment if registration creation somehow fails
      await Workshop.findByIdAndUpdate(workshopId, { $inc: { bookedSeats: -1 } });
      throw regError;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel a registration
// @route   PATCH /api/registrations/:id/cancel
// @access  Manager, Staff
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({ message: 'Registration is already cancelled' });
    }

    // Update registration record (preserve history, do not delete)
    registration.status = 'cancelled';
    registration.cancelledBy = req.user._id;
    registration.cancelledAt = new Date();
    await registration.save();

    // Free up the seat atomically (decrement, but never below 0)
    await Workshop.findOneAndUpdate(
      { _id: registration.workshop, bookedSeats: { $gt: 0 } },
      { $inc: { bookedSeats: -1 } }
    );

    const populatedRegistration = await registration.populate([
      { path: 'workshop', select: 'title code dateTime' },
      { path: 'registeredBy', select: 'name email role' },
      { path: 'cancelledBy', select: 'name email role' },
    ]);

    res.json(populatedRegistration);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all registrations (with optional filter by workshop)
// @route   GET /api/registrations
// @access  Manager, Staff
const getRegistrations = async (req, res) => {
  try {
    const { workshopId, status } = req.query;

    let query = {};
    if (workshopId) query.workshop = workshopId;
    if (status) query.status = status;

    const registrations = await Registration.find(query)
      .populate('workshop', 'title code dateTime')
      .populate('registeredBy', 'name email role')
      .populate('cancelledBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerAttendee, cancelRegistration, getRegistrations };