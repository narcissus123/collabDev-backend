import mongoose from "mongoose";
const chatMessageSchema = new mongoose.Schema({
    sender: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            required: false
        }
    },
    receiver: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            required: false
        }
    },
    message: { type: String, required: true },
    seen: { type: Boolean, required: true, default: false }
}, {
    timestamps: true,
    skipVersioning: {
        seen: true
    }
});
export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
