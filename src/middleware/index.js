const express = require('express');
const authStore = require('../services/auth');
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

const loggerStart = (req, res, next) => {
    const timestamp = new Date();
    const formattedDate = formatDate(timestamp);
    console.log(`================= [${formattedDate}] -- ${req.method} ${req.url} =================`);
    next();
}

const responseLogger = (req, res, next) => {
    const oldSend = res.send;
    res.send = function (data) {
        
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
        
        console.log(`Response: \n${responseData}`);
        oldSend.apply(res, arguments);
    };
    next();
};

const cookieLogger = (req, res, next) => {
    console.log(`Cookies:`, req.cookies);
    console.log(`Session ID:`, req.sessionID);
    console.log(`Session:`, req.session);
    next();
};
const isAuthenticated = (req, res, next) => {
    if (req.originalUrl === '/auth/facebook/callback' || 
        req.originalUrl === '/health' || 
        req.originalUrl === '/auth/facebook/status'
    ) {
        return next();
    }

    if (req.session && req.session.user && req.session.user.isAuthenticated) {
        if (new Date(req.session.user.tokenExpiresAt) > new Date()) {
            console.log(`User is authenticated: ${req.session.user.userId}`);
            return next();
        }
        console.log(`Session expired for user: ${req.session.user.userId}`);
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
            console.log('Session expired, user logged out');
            return res.status(401).json({
                status: 'error',
                message: 'Session expired'
            });
        });
    } else {
        // For unauthenticated users, send 401 for protected routes
        console.log('User is not authenticated');
        return res.status(401).json({
            status: 'error',
            message: 'Authentication required'
        });
    }
}

const verifyFacebookToken = async (req, res, next) => {
    if (!req.session || !req.session.user) {
        return next();
    }
    
    // Check if we have a valid session with Facebook auth
    if (req.session.user.provider === 'facebook' && 
        req.session.user.isAuthenticated &&
        req.session.user.accessToken
    ) {
        try {
            const isValid = await authStore.validateTokenHelper({ 
                accessToken: req.session.user.accessToken 
            });

            if (!isValid) {
                console.log('Facebook token expired, logging out user');
                req.session.destroy();
                return res.status(401).json({
                    status: 'error',
                    message: 'Your Facebook session has expired. Please log in again.'
                });
            }
        } catch (error) {
            console.error('Error verifying Facebook token:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error while verifying Facebook token'
            });
        }
    }
    
    next();
};

// Example middleware function for authentication
router.use((req, res, next) => {
    // Implement authentication logic here
    next();
});

module.exports = {
    loggerStart,
    responseLogger,
    isAuthenticated,
    cookieLogger,

    verifyFacebookToken
};