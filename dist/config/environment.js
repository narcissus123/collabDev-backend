// src/config/environment.ts
export const config = {
    port: process.env.PORT || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.DATABASE || process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/CollabDev',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    corsOrigins: process.env.NODE_ENV === 'production'
        ? [process.env.CLIENT_URL || ''] // Add Netlify URL
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
    aws: {
        accessKey: process.env.AWS_ACCESS_KEY,
        secretKey: process.env.AWS_SECRET_KEY,
        region: process.env.AWS_REGION,
        bucketName: process.env.AWS_BUCKET_NAME
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'my-development-secret'
    }
};
