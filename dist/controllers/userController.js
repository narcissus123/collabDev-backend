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
import { deleteFromS3 } from "../middleware/s3Upload.middleware";
import Project from "../models/projectModel";
import Requests from "../models/requestModel";
import { ChatMessage } from "../models/chatMessageModel";
export const UpdateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.authenticatedUser) === null || _a === void 0 ? void 0 : _a.id;
        // Delete old resume if exists
        const user = yield User.findById(userId);
        if (!userId || userId !== req.params.userId) {
            return res.status(400).json({
                status: 'error',
                message: !userId ? "User not found. Please check the ID and try again." : "Unauthorized access."
            });
        }
        if ((user === null || user === void 0 ? void 0 : user.resume) && req.body.resume !== undefined && req.body.resume !== user.resume) {
            try {
                yield deleteFromS3(user.resume);
            }
            catch (deleteError) {
                console.error("Error deleting old resume:", deleteError);
            }
        }
        if ((user === null || user === void 0 ? void 0 : user.avatar) && req.body.avatar !== undefined && req.body.avatar !== user.avatar) {
            try {
                yield deleteFromS3(user.avatar);
            }
            catch (deleteError) {
                console.error("Error deleting old avatar:", deleteError);
            }
        }
        const updatedUser = yield User.findByIdAndUpdate(userId, { $set: req.body }, {
            new: true
        });
        // Update all projects where this user is an owner
        if (req.body.name || req.body.avatar) {
            const updateData = {
                name: req.body.name || (user === null || user === void 0 ? void 0 : user.name),
                avatar: req.body.avatar || (user === null || user === void 0 ? void 0 : user.avatar)
            };
            // Update Projects
            yield Promise.all([
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
});
export const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User.find();
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
});
export const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.params.userId);
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
});
