const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      // e.g. 'WORKSHOP_UPDATED', 'USER_CREATED', 'REGISTRATION_CANCELLED', 'WAITLIST_JOINED', etc.
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['Workshop', 'User', 'Registration', 'Waitlist'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetLabel: {
      // Human-readable: workshop title, user name, etc.
      type: String,
      default: '',
    },
    changes: {
      // Snapshot: { field: { from, to } }
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    meta: {
      // Any extra context (role changes, seat counts, etc.)
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for fast recent-log queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
