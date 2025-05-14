const express = require('express');
const router = express.Router();
const { pdfToWord } = require('../controllers/pdfController');

router.post('/to-word', pdfToWord);

module.exports = router;