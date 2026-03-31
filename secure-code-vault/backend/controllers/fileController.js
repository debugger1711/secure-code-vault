const fs = require('fs');
const path = require('path');
const File = require('../models/File');
const User = require('../models/User');
const { encryptBuffer, decryptBuffer } = require('../utils/encryption');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// POST /api/files/upload
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided.' });
    }

    const { originalname, buffer, mimetype, size } = req.file;

    // Encrypt the file buffer
    const { encryptedBuffer, iv } = encryptBuffer(buffer);

    // Generate a random name for storage
    const encryptedName = `${Date.now()}-${Math.random().toString(36).substring(2)}.enc`;
    const encryptedPath = path.join(UPLOADS_DIR, encryptedName);

    // Write encrypted file to disk
    fs.writeFileSync(encryptedPath, encryptedBuffer);

    const ext = path.extname(originalname).toLowerCase();

    const file = new File({
      user: req.user._id,
      originalName: originalname,
      encryptedName,
      mimeType: mimetype,
      size,
      encryptedPath,
      iv,
      extension: ext
    });

    await file.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { fileCount: 1 } });

    res.status(201).json({
      message: 'File uploaded and encrypted successfully.',
      file: {
        id: file._id,
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        extension: file.extension,
        uploadedAt: file.uploadedAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload and encrypt file.' });
  }
};

// GET /api/files
exports.getFiles = async (req, res) => {
  try {
    const files = await File.find({ user: req.user._id })
      .select('-iv -encryptedPath -encryptedName')
      .sort({ uploadedAt: -1 });

    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files.' });
  }
};

// GET /api/files/:id/download
exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    if (!fs.existsSync(file.encryptedPath)) {
      return res.status(404).json({ error: 'Encrypted file not found on disk.' });
    }

    const encryptedBuffer = fs.readFileSync(file.encryptedPath);
    const decryptedBuffer = decryptBuffer(encryptedBuffer, file.iv);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Length': decryptedBuffer.length
    });

    res.send(decryptedBuffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to decrypt and download file.' });
  }
};

// DELETE /api/files/:id
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Delete the encrypted file from disk
    if (fs.existsSync(file.encryptedPath)) {
      fs.unlinkSync(file.encryptedPath);
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { fileCount: -1 } });

    res.json({ message: 'File deleted successfully.' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file.' });
  }
};
