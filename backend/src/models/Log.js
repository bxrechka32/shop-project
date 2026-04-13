// backend/src/models/Log.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: { type: Number, default: null },
  userEmail: { type: String, default: 'anonymous' },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.Mixed },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
});

logSchema.index({ timestamp: -1 });
logSchema.index({ userId: 1 });
logSchema.index({ action: 1 });

module.exports = mongoose.model('Log', logSchema);
