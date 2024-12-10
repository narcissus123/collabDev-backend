import Project from "../models/projectModel.js";
import dayjs from "dayjs";
import mongoose from "mongoose";
import { deleteFromS3 } from "../middleware/s3Upload.middleware.js";
export const updateProject = async (req, res) => {
    try {
        const userId = req.authenticatedUser?.id;
        // Delete old cover image if exists
        const project = await Project.findById(req.params.projectId);
        if (!project?.owner?._id || project.owner._id.toString() !== userId?.toString()) {
            return res.status(400).json({
                status: 'error',
                message: "Unauthorized access."
            });
        }
        if (project?.coverImage && req.body.coverImage !== undefined && req.body.coverImage !== project.coverImage) {
            try {
                await deleteFromS3(project.coverImage);
            }
            catch (deleteError) {
                console.error("Error deleting old cover image:", deleteError);
            }
        }
        const updatedProject = await Project.findByIdAndUpdate(req.params.projectId, req.body, {
            new: true
        });
        if (!updatedProject) {
            return res.status(404).send({
                message: `Project with ID ${req.params.projectId} not found`
            });
        }
        res.status(200).json(updatedProject);
    }
    catch (error) {
        res.status(500).json({
            message: `Unable to update project with ID ${req.params.projectId}: ${error}`
        });
    }
};
export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res
                .status(404)
                .json({ message: `Project with ID ${req.params.projectId} not found` });
        }
        return res.status(200).json({ data: project });
    }
    catch (error) {
        console.error("Error fetching project by ID:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const createProject = async (req, res) => {
    try {
        const newProject = await Project.create(req.body);
        res.status(201).json(newProject);
    }
    catch (error) {
        const err = error;
        res.status(500).send(`Unable to create new post: ${err}`);
    }
};
export const addCollaborator = async (req, res) => {
    try {
        const { projectId, collaboratorId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        // Verify the requester is the project owner
        if (project?.owner && (project?.owner._id.toString() !== req.authenticatedUser?.id.toString())) {
            return res.status(403).json({ message: "Not authorized to add collaborators" });
        }
        const updatedProject = await Project.findByIdAndUpdate(projectId, { $addToSet: { contributors: collaboratorId } }, { new: true });
        res.status(200).json({
            status: "success",
            data: updatedProject
        });
    }
    catch (error) {
        const err = error;
        console.error("Error adding collaborator:", err);
        return res.status(500).send("Unable to add collaborator. Please try again later.");
    }
};
const getArray = (value) => {
    if (typeof value === "string")
        return value?.split(",").map((item) => item.trim());
    if (Array.isArray(value) && value.length > 0)
        return value;
    return [];
};
export const getAllProjects = async (req, res) => {
    try {
        const { category, status, techStack, likes, startDate, dueDate, location, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
        const filter = {};
        const categories = getArray(category);
        if (categories.length !== 0) {
            filter.category = { $in: categories };
        }
        if (status) {
            filter.status = getArray(status);
        }
        const techStacks = getArray(techStack);
        if (techStacks.length !== 0) {
            filter.techStack = { $elemMatch: { value: { $in: techStacks } } };
        }
        if (likes) {
            filter.likes = { $gte: Number(likes) };
        }
        if (startDate) {
            filter.startDate = {
                $gte: dayjs(startDate)
                    .startOf("day")
                    .toDate()
            };
        }
        if (dueDate) {
            filter.dueDate = {
                $lte: dayjs(dueDate)
                    .endOf("day")
                    .toDate()
            };
        }
        if (location) {
            filter.location = { $regex: location, $options: "i" };
        }
        const sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === "desc" ? -1 : 1;
        }
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const total = await Project.countDocuments(filter);
        // If no documents found with filters
        if (total === 0) {
            return res.status(200).json({
                status: "success",
                data: {
                    projects: [],
                    total: 0,
                    page: pageNum,
                    totalPages: 0
                }
            });
        }
        const totalPages = Math.ceil(total / limitNum);
        // If page is out of bounds, return last available page
        const adjustedPage = Math.min(pageNum, Math.max(totalPages, 1));
        const adjustedSkip = (adjustedPage - 1) * limitNum;
        const projects = await Project.find(filter)
            .sort(sort)
            .skip(adjustedSkip)
            .limit(limitNum);
        const response = {
            status: "success",
            data: {
                projects,
                total,
                page: pageNum,
                totalPages
            }
        };
        return res.status(200).json(response);
    }
    catch (err) {
        console.error("Error retrieving projects:", err);
        if (err instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Invalid query parameters",
                code: 400,
                errors: Object.values(err.errors).map((e) => e.message)
            });
        }
        // Server error response
        const errorResponse = {
            status: "error",
            message: "Internal server error while retrieving projects",
            code: 500
        };
        return res.status(500).json(errorResponse);
    }
};
export const getProjectsByOwnerId = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const projects = await Project.find({ "owner._id": ownerId });
        res.status(200).json(projects);
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        // Find the project and check if it exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        // Verify the requester is the project owner
        if (project?.owner && (project?.owner._id.toString() !== req.authenticatedUser?.id.toString())) {
            return res.status(403).json({ message: "You don't have permission to delete this project" });
        }
        // Check if the project has any contributors
        if (project.contributors && project.contributors.length > 0) {
            return res.status(400).json({
                error: "Cannot delete project with active contributors."
            });
        }
        // Delete cover image from S3 if it exists
        if (project.coverImage) {
            try {
                await deleteFromS3(project.coverImage);
            }
            catch (error) {
                console.error('Error deleting cover image:', error);
                // Continue with deletion even if image deletion fails
            }
        }
        // Delete all screenshots from S3 if they exist
        if (project.screenshots && project.screenshots.length > 0) {
            const deletePromises = project.screenshots.map(async (screenshot) => {
                try {
                    await deleteFromS3(screenshot);
                }
                catch (error) {
                    console.error(`Error deleting screenshot ${screenshot}:`, error);
                    // Continue with deletion even if image deletion fails
                }
            });
            await Promise.all(deletePromises);
        }
        // Delete the project
        await Project.findByIdAndDelete(projectId);
        res.status(200).json({
            message: "Project successfully deleted",
            projectId
        });
    }
    catch (error) {
        console.error('Error in deleteProject:', error);
        res.status(500).json({
            error: "Failed to delete project. Please try again later."
        });
    }
};
