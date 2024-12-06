import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const ATLAS_API_KEY = process.env.ATLAS_API_KEY;
const ATLAS_PROJECT_ID = process.env.ATLAS_PROJECT_ID;

export const updateMongoIPWhitelist = async () => {
  try {
    // Get current Heroku dyno's IP
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    const currentIP = ipResponse.data.ip;

    // MongoDB Atlas API endpoint
    const atlasApiUrl = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${ATLAS_PROJECT_ID}/accessList`;

    if (!ATLAS_API_KEY) {
      throw new Error('ATLAS_API_KEY is not defined');
    }

    // Adding IP to whitelist
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(ATLAS_API_KEY + ':').toString('base64')}`
      };
      
      await axios.post(
        atlasApiUrl,
        {
          ipAddress: currentIP,
          comment: `Heroku Dyno IP - Updated ${new Date().toISOString()}`
        },
        { headers }
      );
    
    console.log(`Successfully whitelisted IP: ${currentIP}`);
  } catch (error) {
    console.error('Failed to update MongoDB IP whitelist:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Atlas API response:', error.response.data);
    }
    throw error;
  }
};