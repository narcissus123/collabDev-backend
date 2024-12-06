import dotenv from "dotenv";
import app from "./app.js";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { ChatMessage } from "./models/chatMessageModel.js";
import { createServer } from "node:http";
import { updateMongoIPWhitelist } from './utils/mongoIPManager';
console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('Loading config from here:', process.env.NODE_ENV === 'production' ? '.env.production' : '.env');
dotenv.config({
    path: process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env'
});
console.log('Database URL being used:', process.env.DATABASE?.substring(0, 20) + '...');
if (process.env.NODE_ENV === 'production') {
    try {
        await updateMongoIPWhitelist();
        console.log('Successfully updated MongoDB IP whitelist');
    }
    catch (error) {
        console.error('Failed to update IP whitelist:', error);
    }
}
const connectWithRetry = async () => {
    try {
        await mongoose.connect(process.env.DATABASE, {
            useNewUrlParser: true,
            tls: true,
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 50,
            minPoolSize: 10,
            retryWrites: true,
            w: 'majority',
            maxIdleTimeMS: 60000
        });
        console.log("DB connection successful");
    }
    catch (error) {
        console.error('Database connection error:', error);
        // Retry after 5 seconds
        setTimeout(connectWithRetry, 5000);
    }
};
// Initial connection
connectWithRetry();
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
            ? [
                "https://collab-dev.vercel.app",
                "https://collab-dev-git-feature-img-narges-hearis-projects.vercel.app"
            ]
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
    socket.on("message", async (message) => {
        try {
            const newMessage = new ChatMessage({
                sender: message.sender,
                receiver: message.receiver,
                message: message.message
            });
            await newMessage.save();
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
    });
    socket.on("messageSeen", async ({ receiverId, senderId }) => {
        try {
            //find and update all messages that sender is x & receiver is Y & message is not seen
            const updatedMessages = await ChatMessage.updateMany({
                "receiver._id": receiverId,
                "sender._id": senderId,
                seen: false
            }, {
                $set: { seen: true }
            }, {
                new: true,
                timestamps: false
            });
            if (updatedMessages) {
                const roomId = getChatRoom(JSON.stringify(senderId), JSON.stringify(receiverId));
                const receiverSocketId = userSocketMap.get(receiverId);
                // Check if receiver is in the room
                if (receiverSocketId &&
                    io.sockets.adapter.rooms.get(roomId)?.has(receiverSocketId)) {
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
    });
    socket.on("deleteMessage", async (messageId) => {
        try {
            const deletedMessage = await ChatMessage.findByIdAndDelete(messageId);
            if (deletedMessage) {
                const roomId = getChatRoom(JSON.stringify(deletedMessage?.sender?._id), JSON.stringify(deletedMessage?.receiver?._id));
                io.to(roomId).emit("messageDeleted", messageId);
            }
        }
        catch (error) {
            console.error("Error deleting message:", error);
        }
    });
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
