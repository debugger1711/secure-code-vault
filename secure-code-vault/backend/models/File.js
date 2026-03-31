const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  encryptedName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  encryptedPath: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  extension: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

fileSchema.index({ user: 1, uploadedAt: -1 });

module.exports = mongoose.model('File', fileSchema);
