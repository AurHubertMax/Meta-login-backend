const express = require('express');
const router = express.Router();

// Import controllers
const pageController = require('../controllers/pageControllers');

router.get('/', pageController.getPages);

module.exports = router;