import { Request, Response } from "express";
import User from "../models/userModel";
import { FileRequest } from "../types/express";
import {
  deleteFromS3,
  getPresignedUrl
} from "../middleware/s3Upload.middleware";

// interface MulterS3File extends Express.MulterS3.File {
//   key: string;
//   location: string;
// }

// interface FileRequest extends Request {
//   files: {
//     [fieldname: string]: MulterS3File[];
//   } | undefined;
// }

export const uploadFile = async (req: FileRequest, res: Response) => {
  let fileType: string | undefined; 
  try {
    const userId = req.authenticatedUser?.id;
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
        return file.key
      })

    res.status(200).json({
      status: 'success',
      message: `${fileType} uploaded successfully`,
      data: filteredFile
      
    });

  } catch (error) {
    console.error(`Error uploading ${fileType}:`, error);
    res.status(500).json({
      status: 'error',
      message: `Unable to upload ${fileType}. Please try again later.`,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const getFileUrl = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user?.resume) {
      return res.status(404).json({
        message: "No file found"
      });
    }
  
    const presignedUrl = await getPresignedUrl(user.resume);
    res.status(200).json({
      resumeUrl: presignedUrl
    });
  } catch (error) {
    console.error("Error getting file URL:", error);
    res.status(500).json({
      message: "Unable to get file URL. Please try again later."
    });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { userId, fileType } = req.params;
    const fileKey = req.body.fileKey; 
    if (userId !== req.authenticatedUser?.id) {
      return res.status(403).json({ 
        message: "Unauthorized to delete this file" 
      });
    }

    await deleteFromS3(fileKey);

    res.status(200).json({
      status: 'success',
      message: `${fileType} deleted successfully`,
      data: { fileKey }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Delete failed`,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};