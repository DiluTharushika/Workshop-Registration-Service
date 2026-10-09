const Workshop = require('../models/Workshop');
const AuditLog = require('../models/AuditLog');

// ── helper: write one audit entry ──────────────────────────────────────────
const audit = (action, performedBy, targetId, targetLabel, changes = {}, meta = {}) =>
  AuditLog.create({ action, performedBy, targetType: 'Workshop', targetId, targetLabel, changes, meta })
    .catch((e) => console.error('Audit log failed:', e));

// @desc    Create a workshop
// @route   POST /api/workshops
// @access  Manager only
const createWorkshop = async (req, res) => {
  try {
    const { code, title, instructor, dateTime, capacity, description } = req.body;

    if (!code || !title || !instructor || !dateTime || !capacity) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const codeExists = await Workshop.findOne({ code });
    if (codeExists) {
      return res.status(400).json({ message: 'Workshop code already exists' });
    }

    const workshop = await Workshop.create({
      code,
      title,
      instructor,
      dateTime,
      capacity,
      description,
      bookedSeats: 0,
      status: 'active',
      createdBy: req.user._id,
    });

    await audit('WORKSHOP_CREATED', req.user._id, workshop._id, workshop.title, {}, {
      code, title, instructor, capacity,
    });

    res.status(201).json(workshop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all workshops (with filters)
// @route   GET /api/workshops
// @access  Manager, Staff
const getWorkshops = async (req, res) => {
  try {
    const { status, fromDate, toDate, availableOnly } = req.query;

    let query = {};
    if (status) query.status = status;

    if (fromDate || toDate) {
      query.dateTime = {};
      if (fromDate) query.dateTime.$gte = new Date(fromDate);
      if (toDate)   query.dateTime.$lte = new Date(toDate);
    }

    let workshops = await Workshop.find(query).sort({ dateTime: 1 });

    if (availableOnly === 'true') {
      workshops = workshops.filter((w) => w.bookedSeats < w.capacity);
    }

    res.json(workshops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single workshop
// @route   GET /api/workshops/:id
// @access  Manager, Staff
const getWorkshopById = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    res.json(workshop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a workshop
// @route   PUT /api/workshops/:id
// @access  Manager only
const updateWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

    const { title, instructor, dateTime, capacity, status, description } = req.body;

    if (capacity !== undefined && capacity < workshop.bookedSeats) {
      return res.status(400).json({
        message: `Cannot set capacity below current booked seats (${workshop.bookedSeats})`,
      });
    }

    // Build diff for audit
    const FIELDS = ['title', 'instructor', 'dateTime', 'capacity', 'status', 'description'];
    const changes = {};
    const incoming = { title, instructor, dateTime, capacity, status, description };
    for (const f of FIELDS) {
      if (incoming[f] !== undefined && String(incoming[f]) !== String(workshop[f])) {
        changes[f] = { from: workshop[f], to: incoming[f] };
      }
    }

    if (title       !== undefined) workshop.title       = title;
    if (instructor  !== undefined) workshop.instructor  = instructor;
    if (dateTime    !== undefined) workshop.dateTime    = dateTime;
    if (capacity    !== undefined) workshop.capacity    = capacity;
    if (status      !== undefined) workshop.status      = status;
    if (description !== undefined) workshop.description = description;

    const updated = await workshop.save();

    if (Object.keys(changes).length > 0) {
      await audit('WORKSHOP_UPDATED', req.user._id, updated._id, updated.title, changes);
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join the waitlist for a full workshop
// @route   POST /api/workshops/:id/waitlist
// @access  Manager, Staff
const joinWaitlist = async (req, res) => {
  try {
    const { attendeeName, attendeeEmail } = req.body;
    if (!attendeeName || !attendeeEmail) {
      return res.status(400).json({ message: 'attendeeName and attendeeEmail are required' });
    }

    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (workshop.status !== 'active') {
      return res.status(400).json({ message: 'Cannot join waitlist for an inactive workshop' });
    }

    // Check not already on waitlist
    const alreadyOn = workshop.waitlist.some(
      (e) => e.attendeeEmail === attendeeEmail.toLowerCase()
    );
    if (alreadyOn) {
      return res.status(409).json({ message: 'This attendee is already on the waitlist' });
    }

    workshop.waitlist.push({ attendeeName, attendeeEmail, addedBy: req.user._id });
    await workshop.save();

    await audit('WAITLIST_JOINED', req.user._id, workshop._id, workshop.title, {}, {
      attendeeName, attendeeEmail, position: workshop.waitlist.length,
    });

    res.status(201).json({ message: 'Added to waitlist', position: workshop.waitlist.length, workshop });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove someone from the waitlist
// @route   DELETE /api/workshops/:id/waitlist/:entryId
// @access  Manager, Staff
const leaveWaitlist = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

    const entry = workshop.waitlist.id(req.params.entryId);
    if (!entry) return res.status(404).json({ message: 'Waitlist entry not found' });

    const label = entry.attendeeName;
    entry.deleteOne();
    await workshop.save();

    await audit('WAITLIST_LEFT', req.user._id, workshop._id, workshop.title, {}, { attendeeName: label });

    res.json({ message: 'Removed from waitlist', workshop });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createWorkshop,
  getWorkshops,
  getWorkshopById,
  updateWorkshop,
  joinWaitlist,
  leaveWaitlist,
};