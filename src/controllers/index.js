const express = require('express');
const router = express.Router();
const axios = require('axios');


const APP_CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const APP_CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;

const facebookAuthStore = {
    status: null,
    isvalid: null,
    message: null,
    timestamp: null,
    tokens: {
        userId: null,
        accessToken: null,
        expiresIn: null,
    }
}

const updateAuthStatus = (status, isvalid, message, userId, accessToken, expiresIn) => {
    facebookAuthStore.status = status;
    facebookAuthStore.isvalid = isvalid;
    facebookAuthStore.message = message;
    facebookAuthStore.timestamp = new Date().toISOString();
    facebookAuthStore.tokens.userId = userId;
    facebookAuthStore.tokens.accessToken = accessToken;
    facebookAuthStore.tokens.expiresIn = expiresIn;
}

const disconnectFacebook = async (req, res) => {
    updateAuthStatus('disconnected', false, 'Disconnected from Facebook', null, null, null);
    
    res.status(200).json({
        status: 'success',
        message: 'Disconnected from Facebook'
    });
}

const health = (req, res) => {
    console.log('Controller function called');
    res.status(200).json({
        status: 'success',
        message: 'This is a response from the controller function!'
    });
}

const validateTokenHelper = async (data) => {
    const { accessToken } = data;
    try {
        const response = await axios.get(`https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${APP_CLIENT_ID}|${APP_CLIENT_SECRET}`);
        if (response.data && response.data.data && response.data.data.is_valid) {
            console.log('Token is valid');
            return true;
        } else {
            console.log('Token is invalid');
            return false;
        }
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
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
        const isValid = await validateTokenHelper(data);
        if (!isValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token'
            });
        }
        // Update the auth status
        await updateAuthStatus('connected', true, 'Facebook authentication successful', data.userID, data.accessToken, data.expiresIn);

        res.status(200).json({
            status: 'success',
            message: 'Facebook authentication successful!',
            data: {
                status: facebookAuthStore.status,
                isvalid: facebookAuthStore.isvalid,
                message: facebookAuthStore.message,
                timestamp: facebookAuthStore.timestamp,
                userId: facebookAuthStore.tokens.userId,
                expiresIn: facebookAuthStore.tokens.expiresIn,
            }
        });
    } catch (error) {
        console.error('Error in Facebook auth callback:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}
    

// Export the router
module.exports = {
    health,
    facebookAuthCallback,
    disconnectFacebook,
};