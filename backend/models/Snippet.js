const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: ['javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp', 'go',
           'rust', 'ruby', 'php', 'swift', 'kotlin', 'sql', 'bash', 'html', 'css',
           'json', 'yaml', 'markdown', 'other'],
    default: 'javascript'
  },
  encryptedContent: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  isFavorite: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

snippetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search
snippetSchema.index({ user: 1, title: 'text', language: 1 });

module.exports = mongoose.model('Snippet', snippetSchema);
