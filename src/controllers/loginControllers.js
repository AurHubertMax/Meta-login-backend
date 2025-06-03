const express = require('express');
const router = express.Router();
const axios = require('axios');
const authStore = require('../services/auth');


const disconnectFacebook = async (req, res) => {
    authStore.updateAuthStatus('disconnected', false, 'Disconnected from Facebook', null, null, null);
    res.status(200).json({
        status: 'success',
        message: 'Disconnected from Facebook'
    });
}

const facebookAuthCallback = async (req, res) => {
    console.log('Facebook auth callback called');
    try {
        const { data } = req.body;
        if (!data) {
            return res.status(400).json({
                status: 'error',
                message: 'No data received'
            });
        }

        // Validate the token using the helper function
        const isValid = await authStore.validateTokenHelper(data);
        if (!isValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token'
            });
        }

        const fbExpiresInSeconds = data.expiresIn;
        
        const fbExpiresInMs = fbExpiresInSeconds * 1000;
        
        const sessionMaxAge = 24 * 60 * 60 * 1000;
        
        const cookieMaxAge = Math.min(fbExpiresInMs, sessionMaxAge);

        req.session.cookie.maxAge = cookieMaxAge;
        
        const expirationTimestamp = new Date(Date.now() + cookieMaxAge);

        // Update the auth status
        await authStore.updateAuthStatus('connected', true, 'Facebook authentication successful', data.userID, data.accessToken, data.expiresIn);

        req.session.user = {
            userId: data.userID,
            isAuthenticated: true,
            provider: 'facebook',
            tokenExpiresAt: expirationTimestamp.toISOString(),
            accessToken: data.accessToken,
        }
        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                return res.status(500).json({
                    status: 'error',
                    message: 'Internal server error while saving session'
                });
            }
            console.log('Session saved successfully');
            res.status(200).json({
                status: 'success',
                message: 'Facebook authentication successful!',
                data: {
                    status: authStore.facebookAuthStore.status,
                    isvalid: authStore.facebookAuthStore.isvalid,
                    message: authStore.facebookAuthStore.message,
                    timestamp: authStore.facebookAuthStore.timestamp,
                    userId: authStore.facebookAuthStore.tokens.userId,
                    expiresIn: authStore.facebookAuthStore.tokens.expiresIn,
                }
            });
        })
        
    } catch (error) {
        console.error('Error in Facebook auth callback:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}

const getFacebookAuthStatus = (req, res) => {
    if (req.session && req.session.user && req.session.user.isAuthenticated) {
        return res.status(200).json({
            status: 'success',
            message: 'Facebook authentication status retrieved successfully',
            data: {
                status: 'connected',
                isvalid: true,
                userId: req.session.user.userId,
                provider: req.session.user.provider,
                tokenExpiresAt: req.session.user.tokenExpiresAt
            }
        });
    } else {
        return res.status(200).json({
            status: 'success',
            message: 'Not authenticated with Facebook',
            data: {
                status: 'disconnected',
                isvalid: false
            }
        });
    }
}
    

// Export the router
module.exports = {
    facebookAuthCallback,
    disconnectFacebook,
    getFacebookAuthStatus
};