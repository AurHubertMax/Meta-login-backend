const express = require('express');

const router = express.Router();

const formatDate = (date) => {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true // This ensures time is in 12-hour format with AM/PM
    });
}

const requestLogger = (req, res, next) => {
    const timestamp = new Date()
    const formattedDate = formatDate(timestamp);
    console.log(`[${formattedDate}] ${req.method} ${req.url}`);
    next();
};

const responseLogger = (req, res, next) => {
    const oldSend = res.send;
    res.send = function (data) {
        const timestamp = new Date();
        const formattedDate = formatDate(timestamp);
        
        // Format JSON data for better readability
        let responseData;
        try {
            if (typeof data === 'string' && data.trim().startsWith('{')) {
                const jsonData = JSON.parse(data);
                responseData = JSON.stringify(jsonData, null, 4);
            } else if (typeof data === 'object') {
                responseData = JSON.stringify(data, null, 4);
            } else {
                responseData = data;
            }
        } catch (error) {
            responseData = data;
        }
        
        console.log(`[${formattedDate}] Response: \n${responseData}`);
        oldSend.apply(res, arguments);
    };
    next();
};

// Example middleware function for authentication
router.use((req, res, next) => {
    // Implement authentication logic here
    next();
});

module.exports = {
    requestLogger,
    responseLogger
};