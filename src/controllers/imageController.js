const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const jpgToPng = async (req, res) => {
  try {
    if (!req.file || req.file.mimetype !== 'image/jpeg') {
      return res.status(400).json({ success: false, message: 'Please upload a JPG file' });
    }
    const inputPath = req.file.path;
    const outputFileName = `${uuidv4()}.png`;
    const outputPath = path.join(__dirname, '../../converted', outputFileName);
    await sharp(inputPath).png().toFile(outputPath);
    const downloadUrl = `/converted/${outputFileName}`;
    res.json({ success: true, downloadUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Conversion failed' });
  }
};

module.exports = { jpgToPng };