import { Request, Response } from "express";
import Requests from "../models/requestModel";
// import { ChatMessage } from "../models/chatMessageModel";
import Project from "../models/projectModel";

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
    const requestsList = await Requests.find({
      $or: [
        {
          "contributor._id": req.params.requestId
        },
        {
          "owner._id": req.params.requestId
        }
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
  try {
    const updatedRequest = await Requests.findByIdAndUpdate(
      req.params.requestId,
      req.body,
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).send({
        message: `Request with ID ${req.params.requestId} not found`
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      updatedRequest.project,
      { $addToSet: { contributors: updatedRequest.contributor } },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).send({
        message: `Project with ID ${updatedRequest.project} not found`
      });
    }

    // const initialMessage = new ChatMessage({
    //   sender:
    //     updatedRequest?.messageType === "invitation_request"
    //       ? updatedRequest?.owner
    //       : updatedRequest?.contributor,
    //   receiver:
    //     updatedRequest?.messageType === "invitation_request"
    //       ? updatedRequest?.contributor
    //       : updatedRequest?.owner,
    //   message: updatedRequest?.message
    // });

    // const savedMessage = await initialMessage.save();

    res.status(200).json({
      updatedRequest,
      updatedProject
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error accepting request:", err);
    return res
      .status(500)
      .send(`Unable to update the request. Please try again later.`);
  }
};

export const rejectUserRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.body;
    const request = await Requests.findById(requestId);

    if (!request) {
      return res.status(404).send({
        message: `Request with ID ${requestId} not found`
      });
    }

    await Requests.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Request rejected" });
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
    const request = await Requests.findByIdAndDelete(req.params.requestId);

    if (!request) {
      return res.status(404).send({
        message: `Request with ID ${req.params.requestId} not found`
      });
    }

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    const err = error as Error;
    console.error("Error deleting request:", err);
    res.status(500).send(`Unable to delete the request.`);
  }
};
