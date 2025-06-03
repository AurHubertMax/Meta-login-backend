const express = require('express');
const router = express.Router();
const axios = require('axios');
const authStore = require('../services/auth');

const getPages = async (req, res) => {
    console.log(`Fetching pages for user...`);
    try {
        if (!req.session || !req.session.user || !req.session.user.isAuthenticated) {
            return res.status(401).json({
                status: 'error',
                message: 'User is not authenticated'
            });
        }

        const accessToken = req.session.user.accessToken;
        if (!accessToken) {
            return res.status(401).json({
                status: 'error',
                message: 'No access token found'
            });
        }

        const response = await axios.get(`https://graph.facebook.com/v23.0/me/accounts?fields=name,access_token,tasks,instagram_business_account&access_token=${accessToken}`);
        const pages = response.data.data;

        res.status(200).json({
            status: 'success',
            data: pages
        });
    } catch (error) {
        console.error('Error fetching pages:', error);
        if (error.response) {
            console.error('API error response:', error.response.data);
            return res.status(error.response.status).json({
                status: 'error',
                message: 'Error from Facebook API',
                error: error.response.data
            });
        }
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch pages',
            error: error.message
        });
    }
}

module.exports = {
    getPages
}