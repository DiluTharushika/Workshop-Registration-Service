const Workshop = require('../models/Workshop');

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

    if (status) {
      query.status = status;
    }

    if (fromDate || toDate) {
      query.dateTime = {};
      if (fromDate) query.dateTime.$gte = new Date(fromDate);
      if (toDate) query.dateTime.$lte = new Date(toDate);
    }

    let workshops = await Workshop.find(query).sort({ dateTime: 1 });

    // Filter workshops with available seats (done after fetch since it's a computed condition)
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
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
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

    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    const { title, instructor, dateTime, capacity, status, description } = req.body;

    // Prevent reducing capacity below already booked seats
    if (capacity !== undefined && capacity < workshop.bookedSeats) {
      return res.status(400).json({
        message: `Cannot set capacity below current booked seats (${workshop.bookedSeats})`,
      });
    }

    if (title !== undefined) workshop.title = title;
    if (instructor !== undefined) workshop.instructor = instructor;
    if (dateTime !== undefined) workshop.dateTime = dateTime;
    if (capacity !== undefined) workshop.capacity = capacity;
    if (status !== undefined) workshop.status = status;
    if (description !== undefined) workshop.description = description;

    const updatedWorkshop = await workshop.save();

    res.json(updatedWorkshop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createWorkshop, getWorkshops, getWorkshopById, updateWorkshop };