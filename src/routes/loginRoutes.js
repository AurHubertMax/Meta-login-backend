const express = require('express');
const router = express.Router();

// Import controllers
const metaController = require('../controllers/loginControllers');

// Define main application routes
router.post('/facebook/callback', metaController.facebookAuthCallback);
router.post('/facebook/disconnect', metaController.disconnectFacebook);
router.get('/facebook/status', metaController.getFacebookAuthStatus);

module.exports = router;