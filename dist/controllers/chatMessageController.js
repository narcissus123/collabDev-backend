var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ChatMessage } from "../models/chatMessageModel";
import mongoose from "mongoose";
export const getUserChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.userId);
        const conversations = yield ChatMessage.aggregate([
            {
                $match: {
                    $or: [{ "sender._id": userId }, { "receiver._id": userId }],
                },
            },
            {
                $sort: { updatedAt: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: [{ $eq: ["$sender._id", userId] }, "$receiver", "$sender"],
                    },
                    latestMessage: { $first: "$$ROOT" },
                },
            },
            {
                $project: {
                    _id: 0,
                    participant: "$_id",
                    latestMessage: 1,
                },
            },
            {
                $sort: { "latestMessage.updatedAt": -1 }, // Sort again after grouping
            },
        ]);
        res.status(200).json(conversations);
    }
    catch (error) {
        const err = error;
        res.status(500).send(`Unable to get messages list: ${err}`);
    }
});
export const getUserChatById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const participantId = req.params.participantId;
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const messages = yield ChatMessage.find({
            $or: [
                { "sender._id": userId, "receiver._id": participantId },
                { "sender._id": participantId, "receiver._id": userId },
            ],
        })
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        res.json(messages.reverse());
    }
    catch (error) {
        const err = error;
        res.status(500).send(`Unable to get message: ${err}`);
    }
});
