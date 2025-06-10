const express = require('express');
const router = express.Router();
const axios = require('axios');
const authStore = require('../services/auth');

const getInstagramAccounts = async (req, res) => {
    console.log('Fetching Instagram accounts for user...');
    try {
        const pagesWithInstagram = req.session.user.pages.filter(page => page.instagramBusinessAccount);
        if (pagesWithInstagram.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No Instagram accounts found'
            });
        }

        const instagramAccounts = await Promise.all(pagesWithInstagram.map(async (page) => {
            const accountInfo = await getInstagramAccountInfoHelper(page.instagramBusinessAccount, page.accessToken);

            return {
                instagramId: page.instagramBusinessAccount,
                pageId: page.id,
                pageName: page.name,
                accessToken: page.accessToken,
                username: accountInfo ? accountInfo.username : null,
                profilePictureUrl: accountInfo ? accountInfo.profile_picture_url : null,
                biography: accountInfo ? accountInfo.biography : null
            }
        }))

        req.session.user.instagramAccounts = instagramAccounts

        if (instagramAccounts.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No Instagram accounts found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Instagram accounts fetched successfully',
            data: instagramAccounts
        });


    } catch (error) {
        console.error('Error fetching Instagram accounts:', error);
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
            message: 'Failed to fetch Instagram accounts',
            error: error.message
        });
    }
}

const getInstagramAccountInfoHelper = async (instagramBusinessAccountId, accessToken) => {
    console.log(`Fetching Instagram account information for ID: ${instagramBusinessAccountId}`);
    try {
        const response = await axios.get(
            `https://graph.facebook.com/v19.0/${instagramBusinessAccountId}`, 
            {
                params: {
                    fields: 'username,profile_picture_url,biography,name,media_count,followers_count,follows_count',
                    access_token: accessToken
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error(`Error fetching Instagram account info: ${error.message}`);
        return null;
    }
};

module.exports = {
    getInstagramAccounts,
};


