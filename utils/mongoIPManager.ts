// src/utils/mongoIPManager.ts

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ATLAS_PUBLIC_KEY = process.env.ATLAS_PUBLIC_KEY;
const ATLAS_PRIVATE_KEY = process.env.ATLAS_PRIVATE_KEY;
const ATLAS_PROJECT_ID = process.env.ATLAS_PROJECT_ID;

export const updateMongoIPWhitelist = async () => {
  try {
    // Get current Heroku dyno's IP
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    const currentIP = ipResponse.data.ip;

    // MongoDB Atlas API endpoint
    const atlasApiUrl = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${ATLAS_PROJECT_ID}/accessList`;

    // Add IP to whitelist
    await axios.post(atlasApiUrl, {
      ipAddress: currentIP,
      comment: `Heroku Dyno IP - Updated ${new Date().toISOString()}`
    }, {
      auth: {
        username: ATLAS_PUBLIC_KEY!,
        password: ATLAS_PRIVATE_KEY!
      }
    });

    console.log(`Successfully whitelisted IP: ${currentIP}`);
  } catch (error) {
    console.error('Failed to update MongoDB IP whitelist:', error);
    throw error;
  }
};