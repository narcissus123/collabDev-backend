import { Request, Response } from "express";
import User from "../models/userModel";

export const UpdateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.authenticatedUser?.id;
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).send({
        message: `User not found. Please check the ID and try again.`,
      });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    const err = error as Error;
    console.error("Error updating user:", err);
    return res.status(500).json({
      message: "Unable to update user. Please try again later.",
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error retrieving user:", err);
    return res.status(500).json({
      message: `Unable to retrieve users.`,
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with ID ${req.params.id} not found` });
    }

    return res.status(200).json(user);
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching user with ID:", err);
    return res
      .status(500)
      .json({ message: "Unable to retrieve user information." });
  }
};
