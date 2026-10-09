const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Workshop = require('../models/Workshop');
const AuditLog = require('../models/AuditLog');

// ── helper ──────────────────────────────────────────────────────────────────
const audit = (action, performedBy, targetId, targetLabel, changes = {}, meta = {}) =>
  AuditLog.create({ action, performedBy, targetType: 'Registration', targetId, targetLabel, changes, meta })
    .catch((e) => console.error('Audit log failed:', e));

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

    const existingWorkshop = await Workshop.findById(workshopId);
    if (!existingWorkshop) return res.status(404).json({ message: 'Workshop not found' });
    if (existingWorkshop.status !== 'active') {
      return res.status(400).json({ message: 'Cannot register for a workshop that is not active' });
    }

    // ATOMIC seat claim — prevents overbooking even under concurrent load
    const workshop = await Workshop.findOneAndUpdate(
      { _id: workshopId, status: 'active', $expr: { $lt: ['$bookedSeats', '$capacity'] } },
      { $inc: { bookedSeats: 1 } },
      { new: true }
    );

    if (!workshop) {
      return res.status(409).json({ message: 'Workshop is full. Registration rejected.' });
    }

    try {
      const registration = await Registration.create({
        workshop: workshopId,
        attendeeName,
        attendeeEmail,
        status: 'active',
        registeredBy: req.user._id,
        registeredAt: new Date(),
      });

      const populated = await registration.populate([
        { path: 'workshop', select: 'title code dateTime' },
        { path: 'registeredBy', select: 'name email role' },
      ]);

      await audit('REGISTRATION_CREATED', req.user._id, registration._id,
        `${attendeeName} → ${workshop.title}`, {}, {
          attendeeName, attendeeEmail,
          workshopTitle: workshop.title,
          seatsLeft: workshop.capacity - workshop.bookedSeats,
        });

      return res.status(201).json(populated);
    } catch (regError) {
      // Rollback seat on registration doc failure
      await Workshop.findByIdAndUpdate(workshopId, { $inc: { bookedSeats: -1 } });
      throw regError;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel a registration  — auto-promotes first waitlist entry if any
// @route   PATCH /api/registrations/:id/cancel
// @access  Manager, Staff
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    if (registration.status === 'cancelled') {
      return res.status(400).json({ message: 'Registration is already cancelled' });
    }

    registration.status      = 'cancelled';
    registration.cancelledBy = req.user._id;
    registration.cancelledAt = new Date();
    await registration.save();

    // Free seat atomically
    const workshop = await Workshop.findOneAndUpdate(
      { _id: registration.workshop, bookedSeats: { $gt: 0 } },
      { $inc: { bookedSeats: -1 } },
      { new: true }
    );

    await audit('REGISTRATION_CANCELLED', req.user._id, registration._id,
      registration.attendeeName, {}, {
        workshopId: registration.workshop,
        workshopTitle: workshop?.title,
      });

    // ── Auto-promote waitlist ────────────────────────────────────────────────
    let promoted = null;
    if (workshop && workshop.status === 'active' && workshop.waitlist.length > 0) {
      const next = workshop.waitlist[0];

      // Claim the freed seat atomically
      const claimed = await Workshop.findOneAndUpdate(
        { _id: workshop._id, status: 'active', $expr: { $lt: ['$bookedSeats', '$capacity'] } },
        { $inc: { bookedSeats: 1 }, $pull: { waitlist: { _id: next._id } } },
        { new: true }
      );

      if (claimed) {
        // Create a real registration for the promoted attendee
        const newReg = await Registration.create({
          workshop: workshop._id,
          attendeeName:  next.attendeeName,
          attendeeEmail: next.attendeeEmail,
          status: 'active',
          registeredBy: next.addedBy,   // promoted by whoever put them on waitlist
          registeredAt: new Date(),
        });

        promoted = await newReg.populate([
          { path: 'workshop', select: 'title code dateTime' },
          { path: 'registeredBy', select: 'name email role' },
        ]);

        await audit('WAITLIST_PROMOTED', req.user._id, newReg._id,
          `${next.attendeeName} → ${workshop.title}`, {}, {
            attendeeName: next.attendeeName,
            attendeeEmail: next.attendeeEmail,
            workshopTitle: workshop.title,
          });
      }
    }

    const populatedCancelled = await registration.populate([
      { path: 'workshop', select: 'title code dateTime' },
      { path: 'registeredBy', select: 'name email role' },
      { path: 'cancelledBy', select: 'name email role' },
    ]);

    res.json({ registration: populatedCancelled, promoted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all registrations (with optional filter)
// @route   GET /api/registrations
// @access  Manager, Staff
const getRegistrations = async (req, res) => {
  try {
    const { workshopId, status } = req.query;
    const query = {};
    if (workshopId) query.workshop = workshopId;
    if (status)     query.status   = status;

    const registrations = await Registration.find(query)
      .populate('workshop',      'title code dateTime')
      .populate('registeredBy',  'name email role')
      .populate('cancelledBy',   'name email role')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerAttendee, cancelRegistration, getRegistrations };