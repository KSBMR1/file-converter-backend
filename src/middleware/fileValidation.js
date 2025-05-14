// src/middleware/fileValidation.js
const fileValidation = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // Add more validation (e.g., file size, type) as needed
  next();
};

module.exports = fileValidation;