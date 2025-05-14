
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const rateLimit = require('express-rate-limit');
const pdfRoutes = require('./src/routes/pdfRoutes');
const imageRoutes = require('./src/routes/imageRoutes');
const { cleanupFiles } = require('./src/utils/fileCleanup');

const app = express();

// Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests
});
app.use(limiter);

// File upload setup
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) }
});

// Create directories if they don't exist
const ensureDirs = async () => {
  await fs.mkdir('uploads', { recursive: true });
  await fs.mkdir('converted', { recursive: true });
};
ensureDirs();

// Routes
app.use('/api/convert/pdf', upload.single('file'), pdfRoutes);
app.use('/api/convert/image', upload.single('file'), imageRoutes);

// Serve converted files
app.use('/converted', express.static(path.join(__dirname, 'converted')));

// Cleanup files every 30 minutes
cron.schedule('*/30 * * * *', cleanupFiles);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
