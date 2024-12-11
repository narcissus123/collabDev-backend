import mongoose from "mongoose";
import { Document, Types } from "mongoose";

export interface IContribution extends Document {
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  name: string;
  avatar: string;
  deletedFor: Types.ObjectId[];
}

const requestSchema = new mongoose.Schema(
  {
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
        required: false
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
        required: false
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
  },
  { timestamps: true }
);

const Requests = mongoose.model("requests", requestSchema);
export default Requests;
