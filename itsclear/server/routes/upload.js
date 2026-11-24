const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAdmin } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '-');
    const uniqueName = `${cleanName}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error('Only raster image files (JPG, PNG, WEBP) are allowed'));
  }
});

// POST /api/upload -> single image upload (Admin only)
router.post('/', requireAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// POST /api/upload/multiple -> simultaneous multi-file upload up to 10 images (Admin only)
router.post('/multiple', requireAdmin, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files uploaded' });
    }
    const files = req.files.map((file, idx) => ({
      id: `img-${Date.now().toString(36)}-${idx}`,
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
      alt: path.basename(file.originalname, path.extname(file.originalname))
    }));
    res.json({
      success: true,
      files,
      count: files.length
    });
  } catch (err) {
    console.error('Multiple file upload error:', err);
    res.status(500).json({ error: 'Multiple files upload failed' });
  }
});

module.exports = router;

