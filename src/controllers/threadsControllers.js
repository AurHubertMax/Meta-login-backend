const express = require('express');
const router = express.Router();
const axios = require('axios');
const authStore = require('../services/auth');

const threadsLogin = async (req, res) => {
    const url = `https://threads.net/oauth/authorize?client_id=${process.env.REACT_APP_THREADS_ID}&redirect_uri=${process.env.REACT_APP_THREADS_REDIRECT_URI}&scope=${process.env.REACT_APP_THREADS_SCOPE}&response_type=code`; 
    try {
        res.status(200).json({
            status: 'success',
            message: 'Redirecting to Threads login',
            data: {
                url: url
            }
        });
    } catch (error) {
        console.error('Error in threadsLogin:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
}

const updateSessionWithThreadsData = (req, res) => {
    const threadsData = req.body;
    console.log('Updating session with Threads data:', threadsData);
    if (!threadsData || !threadsData.data.userId || !threadsData.data.accessToken) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid Threads data'
        });
    }
    req.session.user.threads = { 
        userId: threadsData.data.userId,
        accessToken: threadsData.data.accessToken,
        isAuthenticated: true,
        tokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000)
    };

    req.session.save((err) => {
        if (err) {
            console.error('Error saving session:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to update session'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Session updated with Threads data',
        });
    })


}

const getThreadsAccount = async (req, res) => {
    try {
        const accessToken = req.session.user.threads.accessToken;
        if (!accessToken) {
            return res.status(401).json({
                status: 'error',
                message: 'No access token found'
            });
        }

        const accountData = await axios.get('https://graph.threads.net/v1.0/me', {
            params: {
                fields: 'id,username,name,threads_profile_picture_url',
                access_token: accessToken
            }
        });
        if (!accountData || !accountData.data) {
            return res.status(404).json({
                status: 'error',
                message: 'Threads account not found'
            });
        }
        console.log('Threads account data:', accountData.data);
        return res.status(200).json({
            status: 'success',
            data: accountData.data
        });
    } catch (error) {
        console.error('Error fetching Threads account:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch Threads account'
        });
    }
}


module.exports = {
    threadsLogin,
    updateSessionWithThreadsData,
    getThreadsAccount
};
