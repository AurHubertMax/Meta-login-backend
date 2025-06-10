const express = require('express');
const router = express.Router();

// Import controllers
const instagramController = require('../controllers/instagramControllers');

router.get('/', instagramController.getInstagramAccounts);

module.exports = router;