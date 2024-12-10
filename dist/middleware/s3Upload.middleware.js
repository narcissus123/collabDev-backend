import { S3, DeleteObjectCommand, GetObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import multerS3 from "multer-s3";
import dotenv from 'dotenv';
dotenv.config();
const s3Client = new S3({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});
export const uploadToS3 = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: (req, file, cb) => {
            console.log("process.env.AWS_BUCKET_NAME", process.env.AWS_BUCKET_NAME);
            const fileType = req.params?.fileType;
            console.log("fileType", fileType);
            if (fileType === "avatars" || fileType === "badges" || fileType === "coverImage" || fileType === "screenshots") {
                cb(null, "public-read");
            }
            else if (fileType === "resume") {
                cb(null, "private");
            }
            else {
                cb(new Error("Invalid file type!"));
            }
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
        contentDisposition: (req, file, cb) => {
            console.log("Content-Disposition callback invoked for:", file.originalname);
            cb(null, "attachment");
        },
        key: (req, file, cb) => {
            const userId = req.params?.userId;
            const fileType = req.params?.fileType;
            if (!userId || !fileType) {
                console.error("Missing userId or fileType!");
                return cb(new Error("Missing userId or fileType!"), undefined);
            }
            const fileName = `${fileType}/user-${userId}-${Date.now()}-${file.originalname}`;
            console.log("fileName", fileName);
            cb(null, fileName);
        },
    })
});
export const fetchS3FileContents = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    });
    try {
        const response = await s3Client.send(command);
        return response.Body;
    }
    catch (err) {
        console.log(err);
    }
};
export const getPresignedUrl = async (fileKey) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey
    });
    return await getSignedUrl(s3Client, command);
};
export const deleteFromS3 = async (fileKey) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey
    });
    await s3Client.send(command);
};
export const listBucketContents = async () => {
    try {
        const command = new ListObjectsCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Prefix: 'resumes/'
        });
        const response = await s3Client.send(command);
        return response.Contents;
    }
    catch (error) {
        console.error("Error listing bucket contents:", error);
        throw error;
    }
};
