import { Request, Response } from "express";
import Requests from "../models/requestModel.js";
import { ChatMessage } from "../models/chatMessageModel.js";
import mongoose from "mongoose";

export const createRequest = async (req: Request, res: Response) => {
  try {
    const newRequest = await Requests.create(req.body);

    res.status(201).json(newRequest);
  } catch (error) {
    const err = error as Error;
    console.error("Error updating user:", err);
    return res
      .status(500)
      .send(`Unable to create new request. Please try again later.`);
  }
};

export const getUserRequests = async (req: Request, res: Response) => {
  try {
    if(req.params.userId !== req.authenticatedUser?.id){
      return res.status(403).json({ message: "Not authorized to access user requests." });
    }

    const requestsList = await Requests.find({
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
        {deletedFor: {$ne: req.params.userId}}
      ]
      
    });

    return res.status(200).json({
      data: requestsList,
      message: requestsList.length === 0 ? "No requests found" : undefined
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).send(`Unable to get requests: ${err}`);
  }
};

export const acceptUserRequest = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
    session.startTransaction();

  try {
    // Verify the request exists and get current state
    const existingRequest = await Requests.findById(req.params.requestId);
        
    if (!existingRequest) {
      await session.abortTransaction();
      return res.status(404).json({
        message: `Request with ID ${req.params.requestId} not found`
      });
    }

    // Verify the recipient is accepting the request
    if( existingRequest.contributor && existingRequest.owner) {
      const isRecipient = 
        (existingRequest.messageType === "invitation_request" && 
          existingRequest.contributor._id.toString() === req.authenticatedUser?.id) ||
        (existingRequest.messageType === "collaboration_request" && 
          existingRequest.owner._id.toString() === req.authenticatedUser?.id);

      if (!isRecipient) {
        await session.abortTransaction();
        return res.status(403).json({
          message: "Only the request recipient can accept this request"
        });
      }
    }
   
    // Check if request is in acceptable state
    if (existingRequest.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Request cannot be accepted because it is ${existingRequest.status}`
      });
    }

    const updatedRequest = await Requests.findByIdAndUpdate(
      req.params.requestId,
      { status: "accepted" },
      { new: true, session }
    );

    if (!updatedRequest) {
      await session.abortTransaction();
      return res.status(404).send({
        message: `Request with ID ${req.params.requestId} not found`
      });
    }

    const initialMessage = new ChatMessage({
      sender:
        updatedRequest?.messageType === "invitation_request"
          ? updatedRequest?.owner
          : updatedRequest?.contributor,
      receiver:
        updatedRequest?.messageType === "invitation_request"
          ? updatedRequest?.contributor
          : updatedRequest?.owner,
      message: updatedRequest?.message,
      seen: false
    });

    await initialMessage.save({ session });
    await session.commitTransaction();

    res.status(200).json({
        status: "success",
        data: {
          request: updatedRequest,
          chatInitiated: true
        }
      });
  } catch (error) {
    await session.abortTransaction();
    const err = error as Error;
    console.error("Error accepting request:", err);
    return res
      .status(500)
      .send(`Unable to update the request. Please try again later.`);
  }
};

export const rejectUserRequest = async (req: Request, res: Response) => {
  try {
    // Verify the request exists and get current state
    const existingRequest = await Requests.findById(req.params.requestId);
    
    if (!existingRequest) {
      return res.status(404).json({
        message: `Request with ID ${req.params.requestId} not found`
      });
    }

    // Verify the user is authorized to reject this request.
    if( existingRequest.contributor && existingRequest.owner) {
      const isAuthorizedToReject = 
      (existingRequest.messageType === "invitation_request" && 
       existingRequest.contributor._id.toString() === req.authenticatedUser?.id) ||
      (existingRequest.messageType === "collaboration_request" && 
       existingRequest.owner._id.toString() === req.authenticatedUser?.id);

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
    const updatedRequest = await Requests.findByIdAndUpdate(
      req.params.requestId,
      { status: "rejected" },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      data: updatedRequest
    });
    
  } catch (error) {
    const err = error as Error;
    console.error("Error rejecting request:", err);
    return res
      .status(500)
      .send(`Unable to update the request. Please try again later.`);
  }
};

export const deleteUserRequest = async (req: Request, res: Response) => {
  try {
    const request = await Requests.findByIdAndUpdate(
      req.params.requestId,
      { $addToSet: { deletedFor: req.authenticatedUser?.id } },
      { new: true } 
    );

    if (!request) {
      return res.status(404).send({
        message: `Request with ID ${req.params.requestId} not found`
      });
    }

    // If both parties have deleted, remove from DB
    if (request.deletedFor.length === 2) {
      await Requests.findByIdAndDelete(req.params.requestId);
    }

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    const err = error as Error;
    console.error("Error deleting request:", err);
    res.status(500).send(`Unable to delete the request.`);
  }
};
