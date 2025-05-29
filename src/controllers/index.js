const express = require('express');
const router = express.Router();

const health = (req, res) => {
    console.log('Controller function called');
    res.status(200).json({
        status: 'success',
        message: 'This is a response from the controller function!'
    });
}

// Export the router
module.exports = {
    health,
};