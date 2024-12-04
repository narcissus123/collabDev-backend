var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
            var _a;
            const fileType = (_a = req.params) === null || _a === void 0 ? void 0 : _a.fileType;
            if (fileType === "avatars" || fileType === "badges") {
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
            var _a, _b;
            const userId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.userId;
            const fileType = (_b = req.params) === null || _b === void 0 ? void 0 : _b.fileType;
            if (!userId || !fileType) {
                console.error("Missing userId or fileType!");
                return cb(new Error("Missing userId or fileType!"), undefined);
            }
            const fileName = `${fileType}/user-${userId}-${Date.now()}-${file.originalname}`;
            cb(null, fileName);
        },
    })
});
export const fetchS3FileContents = (key) => __awaiter(void 0, void 0, void 0, function* () {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    });
    try {
        const response = yield s3Client.send(command);
        return response.Body;
    }
    catch (err) {
        console.log(err);
    }
});
export const getPresignedUrl = (fileKey) => __awaiter(void 0, void 0, void 0, function* () {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey
    });
    return yield getSignedUrl(s3Client, command);
});
export const deleteFromS3 = (fileKey) => __awaiter(void 0, void 0, void 0, function* () {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey
    });
    yield s3Client.send(command);
});
export const listBucketContents = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const command = new ListObjectsCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Prefix: 'resumes/'
        });
        const response = yield s3Client.send(command);
        return response.Contents;
    }
    catch (error) {
        console.error("Error listing bucket contents:", error);
        throw error;
    }
});
