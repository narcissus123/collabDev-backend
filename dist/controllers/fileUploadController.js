var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from "../models/userModel";
import { deleteFromS3, getPresignedUrl } from "../middleware/s3Upload.middleware";
// interface MulterS3File extends Express.MulterS3.File {
//   key: string;
//   location: string;
// }
// interface FileRequest extends Request {
//   files: {
//     [fieldname: string]: MulterS3File[];
//   } | undefined;
// }
export const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let fileType;
    try {
        const userId = (_a = req.authenticatedUser) === null || _a === void 0 ? void 0 : _a.id;
        fileType = req.params.fileType;
        const files = req.files;
        if (!files || !userId || userId !== req.params.userId) {
            return res.status(400).json({
                status: 'error',
                message: !files ? "No file uploaded" : "Invalid request"
            });
        }
        let filteredFile = {};
        filteredFile = files[fileType].map((file) => {
            return file.key;
        });
        res.status(200).json({
            status: 'success',
            message: `${fileType} uploaded successfully`,
            data: filteredFile
        });
    }
    catch (error) {
        console.error(`Error uploading ${fileType}:`, error);
        res.status(500).json({
            status: 'error',
            message: `Unable to upload ${fileType}. Please try again later.`,
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
export const getFileUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield User.findById(userId);
        if (!(user === null || user === void 0 ? void 0 : user.resume)) {
            return res.status(404).json({
                message: "No file found"
            });
        }
        const presignedUrl = yield getPresignedUrl(user.resume);
        res.status(200).json({
            resumeUrl: presignedUrl
        });
    }
    catch (error) {
        console.error("Error getting file URL:", error);
        res.status(500).json({
            message: "Unable to get file URL. Please try again later."
        });
    }
});
export const deleteFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId, fileType } = req.params;
        const fileKey = req.body.fileKey;
        if (userId !== ((_a = req.authenticatedUser) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(403).json({
                message: "Unauthorized to delete this file"
            });
        }
        yield deleteFromS3(fileKey);
        res.status(200).json({
            status: 'success',
            message: `${fileType} deleted successfully`,
            data: { fileKey }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: `Delete failed`,
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
