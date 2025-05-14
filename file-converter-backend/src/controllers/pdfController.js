const { PDFDocument } = require('pdf-lib');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const pdfToWord = async (req, res) => {
  try {
    if (!req.file || req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }
    const inputPath = req.file.path;
    const outputFileName = `${uuidv4()}.docx`;
    const outputPath = path.join(__dirname, '../../converted', outputFileName);
    const result = await mammoth.convertToHtml({ path: inputPath });
    await fs.writeFile(outputPath, result.value);
    const downloadUrl = `/converted/${outputFileName}`;
    res.json({ success: true, downloadUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Conversion failed' });
  }
};

module.exports = { pdfToWord };