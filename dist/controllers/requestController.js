var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Requests from "../models/requestModel";
import { ChatMessage } from "../models/chatMessageModel";
import mongoose from "mongoose";
export const createRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newRequest = yield Requests.create(req.body);
        res.status(201).json(newRequest);
    }
    catch (error) {
        const err = error;
        console.error("Error updating user:", err);
        return res
            .status(500)
            .send(`Unable to create new request. Please try again later.`);
    }
});
export const getUserRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (req.params.userId !== ((_a = req.authenticatedUser) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(403).json({ message: "Not authorized to access user requests." });
        }
        const requestsList = yield Requests.find({
            $and: [
                {
                    $or: [
                        {
                            "contributor._id": req.params.userId
                        },
                        {
                            "owner._id": req.params.userId
                        }
                    ]
                },
                { deletedFor: { $ne: req.params.userId } }
            ]
        });
        return res.status(200).json({
            data: requestsList,
            message: requestsList.length === 0 ? "No requests found" : undefined
        });
    }
    catch (error) {
        const err = error;
        res.status(500).send(`Unable to get requests: ${err}`);
    }
});
export const acceptUserRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const session = yield mongoose.startSession();
    session.startTransaction();
    try {
        // Verify the request exists and get current state
        const existingRequest = yield Requests.findById(req.params.requestId);
        if (!existingRequest) {
            yield session.abortTransaction();
            return res.status(404).json({
                message: `Request with ID ${req.params.requestId} not found`
            });
        }
        // Verify the recipient is accepting the request
        if (existingRequest.contributor && existingRequest.owner) {
            const isRecipient = (existingRequest.messageType === "invitation_request" &&
                existingRequest.contributor._id.toString() === ((_a = req.authenticatedUser) === null || _a === void 0 ? void 0 : _a.id)) ||
                (existingRequest.messageType === "collaboration_request" &&
                    existingRequest.owner._id.toString() === ((_b = req.authenticatedUser) === null || _b === void 0 ? void 0 : _b.id));
            if (!isRecipient) {
                yield session.abortTransaction();
                return res.status(403).json({
                    message: "Only the request recipient can accept this request"
                });
            }
        }
        // Check if request is in acceptable state
        if (existingRequest.status !== "pending") {
            yield session.abortTransaction();
            return res.status(400).json({
                message: `Request cannot be accepted because it is ${existingRequest.status}`
            });
        }
        const updatedRequest = yield Requests.findByIdAndUpdate(req.params.requestId, { status: "accepted" }, { new: true, session });
        if (!updatedRequest) {
            yield session.abortTransaction();
            return res.status(404).send({
                message: `Request with ID ${req.params.requestId} not found`
            });
        }
        const initialMessage = new ChatMessage({
            sender: (updatedRequest === null || updatedRequest === void 0 ? void 0 : updatedRequest.messageType) === "invitation_request"
                ? updatedRequest === null || updatedRequest === void 0 ? void 0 : updatedRequest.owner
                : updatedRequest === null || updatedRequest === void 0 ? void 0 : updatedRequest.contributor,
            receiver: (updatedRequest === null || updatedRequest === void 0 ? void 0 : updatedRequest.messageType) === "invitation_request"
                ? updatedRequest === null || updatedRequest === void 0 ? void 0 : updatedRequest.contributor
                : updatedRequest === null || updatedRequest === void 0 ? void 0 : updatedRequest.owner,
            message: updatedRequest === null || updatedRequest === void 0 ? void 0 : updatedRequest.message,
            seen: false
        });
        yield initialMessage.save({ session });
        yield session.commitTransaction();
        res.status(200).json({
            status: "success",
            data: {
                request: updatedRequest,
                chatInitiated: true
            }
        });
    }
    catch (error) {
        yield session.abortTransaction();
        const err = error;
        console.error("Error accepting request:", err);
        return res
            .status(500)
            .send(`Unable to update the request. Please try again later.`);
    }
});
export const rejectUserRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Verify the request exists and get current state
        const existingRequest = yield Requests.findById(req.params.requestId);
        if (!existingRequest) {
            return res.status(404).json({
                message: `Request with ID ${req.params.requestId} not found`
            });
        }
        // Verify the user is authorized to reject this request.
        if (existingRequest.contributor && existingRequest.owner) {
            const isAuthorizedToReject = (existingRequest.messageType === "invitation_request" &&
                existingRequest.contributor._id.toString() === ((_a = req.authenticatedUser) === null || _a === void 0 ? void 0 : _a.id)) ||
                (existingRequest.messageType === "collaboration_request" &&
                    existingRequest.owner._id.toString() === ((_b = req.authenticatedUser) === null || _b === void 0 ? void 0 : _b.id));
            if (!isAuthorizedToReject) {
                return res.status(403).json({
                    message: "Not authorized to reject this request"
                });
            }
        }
        // Check if request is in rejectable state
        if (existingRequest.status !== "pending") {
            return res.status(400).json({
                message: `Request cannot be rejected because it is ${existingRequest.status}`
            });
        }
        // Update request status
        const updatedRequest = yield Requests.findByIdAndUpdate(req.params.requestId, { status: "rejected" }, { new: true });
        res.status(200).json({
            status: "success",
            data: updatedRequest
        });
    }
    catch (error) {
        const err = error;
        console.error("Error rejecting request:", err);
        return res
            .status(500)
            .send(`Unable to update the request. Please try again later.`);
    }
});
export const deleteUserRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const request = yield Requests.findByIdAndUpdate(req.params.requestId, { $addToSet: { deletedFor: (_a = req.authenticatedUser) === null || _a === void 0 ? void 0 : _a.id } }, { new: true });
        if (!request) {
            return res.status(404).send({
                message: `Request with ID ${req.params.requestId} not found`
            });
        }
        // If both parties have deleted, remove from DB
        if (request.deletedFor.length === 2) {
            yield Requests.findByIdAndDelete(req.params.requestId);
        }
        res.status(200).json({ message: "Request deleted successfully" });
    }
    catch (error) {
        const err = error;
        console.error("Error deleting request:", err);
        res.status(500).send(`Unable to delete the request.`);
    }
});
