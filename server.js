require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const pdfRoutes = require('./src/routes/pdfRoutes');
const imageRoutes = require('./src/routes/imageRoutes');
const { cleanupFiles } = require('./src/utils/fileCleanup');
const libreofficeConvert = require('libreoffice-convert');
const sharp = require('sharp');

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

// New Endpoint: Word to PDF
app.post('/api/convert/word/to-pdf', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const outputFileName = `${path.parse(file.originalname).name}.pdf`;
    const outputPath = path.join(__dirname, 'converted', outputFileName);

    // Convert Word to PDF using libreoffice-convert
    const fileBuffer = await fs.readFile(file.path);
    const converted = await new Promise((resolve, reject) => {
      libreofficeConvert.convert(fileBuffer, '.pdf', undefined, (err, done) => {
        if (err) reject(err);
        else resolve(done);
      });
    });

    await fs.writeFile(outputPath, converted);
    const downloadUrl = `/converted/${outputFileName}`;
    res.json({ success: true, downloadUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// New Endpoint: PNG to JPG
app.post('/api/convert/png/to-jpg', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const outputFileName = `${path.parse(file.originalname).name}.jpg`;
    const outputPath = path.join(__dirname, 'converted', outputFileName);

    // Convert PNG to JPG using sharp
    await sharp(file.path).jpeg().toFile(outputPath);
    const downloadUrl = `/converted/${outputFileName}`;
    res.json({ success: true, downloadUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

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
