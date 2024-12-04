import mongoose from "mongoose";
const requestSchema = new mongoose.Schema({
    owner: {
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
            required: true
        }
    },
    contributor: {
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
            required: true
        }
    },
    messageType: {
        type: String,
        enum: ["invitation_request", "collaboration_request"],
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    deletedFor: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
}, { timestamps: true });
const Requests = mongoose.model("requests", requestSchema);
export default Requests;
