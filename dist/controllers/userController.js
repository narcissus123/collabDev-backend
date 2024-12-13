import User from "../models/userModel.js";
import { deleteFromS3 } from "../middleware/s3Upload.middleware.js";
import Project from "../models/projectModel.js";
import Requests from "../models/requestModel.js";
import { ChatMessage } from "../models/chatMessageModel.js";
export const searchUsers = async (req, res) => {
    try {
        const searchQuery = req.query.q;
        if (!searchQuery) {
            return res.status(400).json({
                status: 'error',
                message: 'Search query is required'
            });
        }
        // Split the search query into words and create a regex pattern for each word
        const searchWords = searchQuery.trim().split(/\s+/);
        const regexPattern = searchWords.map(word => `(?=.*${word})` // Positive lookahead for each word
        ).join('');
        const users = await User.find({
            name: {
                $regex: regexPattern,
                $options: 'i'
            }
        })
            .select('name avatar email')
            .limit(10);
        return res.status(200).json({
            status: 'success',
            data: {
                users
            }
        });
    }
    catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({
            status: 'error',
            message: "An error occurred while searching users"
        });
    }
};
export const UpdateUser = async (req, res) => {
    try {
        const userId = req.authenticatedUser?.id;
        // Delete old resume if exists
        const user = await User.findById(userId);
        if (userId !== req.params.userId) {
            return res.status(400).json({
                status: 'error',
                message: "Unauthorized access."
            });
        }
        if (user?.resume && req.body.resume !== undefined && req.body.resume !== user.resume) {
            try {
                await deleteFromS3(user.resume);
            }
            catch (deleteError) {
                console.error("Error deleting old resume:", deleteError);
            }
        }
        if (user?.avatar && req.body.avatar !== undefined && req.body.avatar !== user.avatar) {
            try {
                await deleteFromS3(user.avatar);
            }
            catch (deleteError) {
                console.error("Error deleting old avatar:", deleteError);
            }
        }
        const updatedUser = await User.findByIdAndUpdate(userId, { $set: req.body }, {
            new: true
        });
        // Update all projects where this user is an owner
        if (req.body.name || req.body.avatar) {
            const updateData = {
                name: req.body.name || user?.name,
                avatar: req.body.avatar || user?.avatar
            };
            // Update Projects
            await Promise.all([
                // Update projects where user is owner
                Project.updateMany({ "owner._id": userId }, {
                    $set: {
                        "owner.name": updateData.name,
                        "owner.avatar": updateData.avatar
                    }
                }),
                // Update projects where user is contributor
                Project.updateMany({ "contributors._id": userId }, {
                    $set: {
                        "contributors.$.name": updateData.name,
                        "contributors.$.avatar": updateData.avatar
                    }
                }),
                // Update ChatMessages where user is sender
                ChatMessage.updateMany({ "sender._id": userId }, {
                    $set: {
                        "sender.name": updateData.name,
                        "sender.avatar": updateData.avatar
                    }
                }),
                // Update ChatMessages where user is receiver
                ChatMessage.updateMany({ "receiver._id": userId }, {
                    $set: {
                        "receiver.name": updateData.name,
                        "receiver.avatar": updateData.avatar
                    }
                }),
                // Update Requests where user is owner
                Requests.updateMany({ "owner._id": userId }, {
                    $set: {
                        "owner.name": updateData.name,
                        "owner.avatar": updateData.avatar
                    }
                }),
                // Update Requests where user is contributor
                Requests.updateMany({ "contributor._id": userId }, {
                    $set: {
                        "contributor.name": updateData.name,
                        "contributor.avatar": updateData.avatar
                    }
                })
            ]);
        }
        res.status(200).json(updatedUser);
    }
    catch (error) {
        const err = error;
        console.error("Error updating user:", err);
        return res.status(500).json({
            message: "Unable to update user. Please try again later."
        });
    }
};
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            status: "success",
            results: users.length,
            data: {
                users
            }
        });
    }
    catch (error) {
        const err = error;
        console.error("Error retrieving user:", err);
        return res.status(500).json({
            message: `Unable to retrieve users.`
        });
    }
};
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res
                .status(404)
                .json({ message: `User with ID ${req.params.id} not found` });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        const err = error;
        console.error("Error fetching user with ID:", err);
        return res
            .status(500)
            .json({ message: "Unable to retrieve user information." });
    }
};
