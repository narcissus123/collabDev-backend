var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from "dotenv";
import app from "./app";
import mongoose from "mongoose";
import { Server } from "socket.io";
dotenv.config({ path: "./.env" });
import { ChatMessage } from "./models/chatMessageModel";
import { createServer } from "node:http";
mongoose
    .connect(process.env.DATABASE, {
    useNewUrlParser: true
})
    .then(() => {
    console.log("DB connection successful");
});
const PORT = process.env.PORT || 3000;
const server = createServer(app);
server.listen(PORT, (err) => {
    if (err) {
        console.error("Failed to start the server:", err);
        return;
    }
    console.log(`App running on port ${PORT}...`);
});
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production"
            ? false
            : ["http://localhost:3000", "http://127.0.0.1:3000"]
    }
});
const getChatRoom = (senderId, receiverId) => {
    return [senderId, receiverId].sort().join("-");
};
const userSocketMap = new Map();
io.on("connection", (socket) => {
    console.log(`User ${socket.id} connected`);
    socket.on("registerUser", (userId) => {
        userSocketMap.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ID ${socket.id}`);
    });
    socket.on("joinRoom", (prop) => {
        if (prop.prevRoom) {
            socket.leave(prop.prevRoom);
        }
        const roomId = getChatRoom(JSON.stringify(prop.userId), JSON.stringify(prop.participantId));
        socket.join(roomId);
    });
    socket.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const newMessage = new ChatMessage({
                sender: message.sender,
                receiver: message.receiver,
                message: message.message
            });
            yield newMessage.save();
            const roomId = getChatRoom(JSON.stringify(message.sender._id), JSON.stringify(message.receiver._id));
            const receiverSocketId = userSocketMap.get(message.receiver._id.toString());
            io.to(roomId).emit("message", newMessage);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("directMessage", roomId, newMessage);
            }
        }
        catch (error) {
            console.error("Error saving message:", error);
        }
    }));
    socket.on("messageSeen", (_a) => __awaiter(void 0, [_a], void 0, function* ({ receiverId, senderId }) {
        var _b;
        try {
            //find and update all messages that sender is x & receiver is Y & message is not seen
            const updatedMessages = yield ChatMessage.updateMany({
                "receiver._id": receiverId,
                "sender._id": senderId,
                seen: false
            }, {
                $set: { seen: true }
            }, { new: true });
            if (updatedMessages) {
                const roomId = getChatRoom(JSON.stringify(senderId), JSON.stringify(receiverId));
                const receiverSocketId = userSocketMap.get(receiverId);
                // Check if receiver is in the room
                if (receiverSocketId &&
                    ((_b = io.sockets.adapter.rooms.get(roomId)) === null || _b === void 0 ? void 0 : _b.has(receiverSocketId))) {
                    io.to(roomId).emit("messageSeen", updatedMessages);
                }
                else {
                    console.log(`Receiver ${receiverId} is not in the room`);
                }
            }
        }
        catch (error) {
            console.error("Error updating message:", error);
        }
    }));
    socket.on("deleteMessage", (messageId) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const deletedMessage = yield ChatMessage.findByIdAndDelete(messageId);
            if (deletedMessage) {
                const roomId = getChatRoom(JSON.stringify((_a = deletedMessage === null || deletedMessage === void 0 ? void 0 : deletedMessage.sender) === null || _a === void 0 ? void 0 : _a._id), JSON.stringify((_b = deletedMessage === null || deletedMessage === void 0 ? void 0 : deletedMessage.receiver) === null || _b === void 0 ? void 0 : _b._id));
                io.to(roomId).emit("messageDeleted", messageId);
            }
        }
        catch (error) {
            console.error("Error deleting message:", error);
        }
    }));
    socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected`);
        // Remove user from userSocketMap
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                break;
            }
        }
    });
});
