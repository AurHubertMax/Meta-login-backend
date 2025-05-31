const express = require('express');
const router = express.Router();

// Import controllers
const metaController = require('../controllers');

// Define main application routes
router.get('/health', metaController.health);

router.post('/auth/facebook/callback', metaController.facebookAuthCallback);
router.get('/auth/facebook/status', metaController.checkFacebookAuthStatus);
router.post('/auth/facebook/disconnect', metaController.disconnectFacebook);

module.exports = router;