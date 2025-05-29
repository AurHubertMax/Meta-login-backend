const express = require('express');
const router = express.Router();

// Import controllers
const { health } = require('../controllers');

// Define main application routes
router.get('/health', health);

module.exports = router;