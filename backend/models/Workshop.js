const mongoose = require('mongoose');

const waitlistEntrySchema = new mongoose.Schema({
  attendeeName:  { type: String, required: true },
  attendeeEmail: { type: String, required: true, lowercase: true },
  addedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  addedAt:       { type: Date, default: Date.now },
});

const workshopSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    instructor: {
      type: String,
      required: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    bookedSeats: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
    },
    description: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // ── Waitlist ──────────────────────────────────────────────
    waitlist: {
      type: [waitlistEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workshop', workshopSchema);