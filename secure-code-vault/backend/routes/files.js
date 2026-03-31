const express = require('express');
const multer = require('multer');
const router = express.Router();
const fileController = require('../controllers/fileController');
const auth = require('../middleware/auth');

const ALLOWED_TYPES = [
  'text/plain', 'application/pdf', 'application/javascript',
  'text/javascript', 'application/zip', 'application/x-zip-compressed',
  'text/x-python', 'text/html', 'text/css', 'application/json',
  'text/markdown', 'application/octet-stream'
];

const ALLOWED_EXTENSIONS = ['.txt', '.pdf', '.js', '.ts', '.zip', '.py',
  '.html', '.css', '.json', '.md', '.jsx', '.tsx', '.sh', '.yaml', '.yml'];

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const ext = require('path').extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
    }
  }
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max size is 10MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

router.use(auth);

router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
}, fileController.uploadFile);

router.get('/', fileController.getFiles);
router.get('/:id/download', fileController.downloadFile);
router.delete('/:id', fileController.deleteFile);

module.exports = router;
