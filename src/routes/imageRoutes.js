const express = require('express');
const router = express.Router();
const { jpgToPng } = require('../controllers/imageController');

router.post('/jpg-to-png', jpgToPng);

module.exports = router;