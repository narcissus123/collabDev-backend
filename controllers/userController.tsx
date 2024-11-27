import { Request, Response } from "express";
import User from "../models/userModel";
import {
  deleteFromS3,
  getPresignedUrl
} from "../middleware/s3Upload.middleware";

export const UpdateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.authenticatedUser?.id;
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true
    });

    if (!updatedUser) {
      return res.status(404).send({
        message: `User not found. Please check the ID and try again.`
      });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    const err = error as Error;
    console.error("Error updating user:", err);
    return res.status(500).json({
      message: "Unable to update user. Please try again later."
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error retrieving user:", err);
    return res.status(500).json({
      message: `Unable to retrieve users.`
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with ID ${req.params.id} not found` });
    }

    return res.status(200).json(user);
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching user with ID:", err);
    return res
      .status(500)
      .json({ message: "Unable to retrieve user information." });
  }
};

export const uploadResume = async (req: Request, res: Response) => {
  try {
    const userId = req.authenticatedUser?.id;
    const file = req.file as Express.MulterS3.File; 
    
    // Validation checks
    if (!file) {
      return res.status(400).json({
        status: 'error',
        message: "No file uploaded"
      });
    }

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: "User not authenticated"
      });
    }

    // Check if user owns this profile
    if (userId !== req.params.userId) {
      return res.status(403).json({
        status: 'error',
        message: "You can only upload resume to your own profile"
      });
    }

    // Delete old resume if exists
    const user = await User.findById(userId);
    if (user?.resume?.fileKey) {
      try {
        await deleteFromS3(user.resume.fileKey);
      } catch (deleteError) {
        console.error("Error deleting old resume:", deleteError);
        // Continue with upload even if delete fails
      }
    }

    const fileKey = file.key;
    const fileUrl = file.location; // S3 URL of the uploaded file

    // Update user record
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        resume: {
          fileKey,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: "User not found"
      });
    }

    res.status(200).json({
      status: 'success',
      message: "Resume uploaded successfully",
      data: {
        user: updatedUser,
        resumeUrl: fileUrl
      }
    });

  } catch (error) {
    console.error("Error uploading resume:", error);
    res.status(500).json({
      status: 'error',
      message: "Unable to upload resume. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const getResumeUrl = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user?.resume?.fileKey) {
      return res.status(404).json({
        message: "No resume found"
      });
    }

    const presignedUrl = await getPresignedUrl(user.resume.fileKey);

    res.status(200).json({
      resumeUrl: presignedUrl
    });
  } catch (error) {
    console.error("Error getting resume URL:", error);
    res.status(500).json({
      message: "Unable to get resume URL. Please try again later."
    });
  }
};

export const deleteResume = async (req: Request, res: Response) => {
  try {
    const userId = req.authenticatedUser?.id;

    // Check if user owns this profile
    if (userId !== req.params.userId) {
      return res.status(403).json({
        message: "You can only delete resume from your own profile"
      });
    }

    const user = await User.findById(userId);
    if (!user?.resume?.fileKey) {
      return res.status(404).json({
        message: "No resume found"
      });
    }

    // Delete from S3
    await deleteFromS3(user.resume.fileKey);

    // Update user record
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { resume: null },
      { new: true }
    );

    res.status(200).json({
      message: "Resume deleted successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({
      message: "Unable to delete resume. Please try again later."
    });
  }
};
