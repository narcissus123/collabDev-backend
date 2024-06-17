import { Request, Response } from "express";
import Project from "../models/projectModel";
import dayjs from "dayjs";

export const updateProject = async (req: Request, res: Response) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.projectId,
      req.body,
      {
        new: true,
      }
    );

    if (!updatedProject) {
      return res.status(404).send({
        message: `Project with ID ${req.params.projectId} not found`,
      });
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({
      message: `Unable to update project with ID ${req.params.projectId}: ${error}`,
    });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with ID ${req.params.projectId} not found` });
    }

    return res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const newProject = await Project.create(req.body);

    res.status(201).json(newProject);
  } catch (error: unknown) {
    const err = error as Error;

    res.status(500).send(`Unable to create new post: ${err}`);
  }
};

interface ProjectFilter {
  category?: { $in: string[] };
  status?: string[];
  techStack?: { $elemMatch: { value: { $in: string[] } } };

  likes?: { $gte: number };
  startDate?: { $gte: Date };
  dueDate?: { $lte: Date };
  location?: { $regex: string; $options: string };
}

const getArray = (value: any) => {
  if (typeof value === "string")
    return value?.split(",").map((item) => item.trim());
  if (Array.isArray(value) && value.length > 0) return value;
  return [];
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const {
      category,
      status,
      techStack,
      likes,
      startDate,
      dueDate,
      location,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = req.query;

    let filter: ProjectFilter = {};

    const categories: string[] = getArray(category);
    if (categories.length !== 0) {
      filter.category = { $in: categories };
    }

    if (status) {
      filter.status = getArray(status);
    }

    const techStacks: string[] = getArray(techStack);

    if (techStacks.length !== 0) {
      filter.techStack = { $elemMatch: { value: { $in: techStacks } } };
    }

    if (likes) {
      filter.likes = { $gte: Number(likes) };
    }

    if (startDate) {
      filter.startDate = {
        $gte: dayjs(startDate as string)
          .startOf("day")
          .toDate(),
      };
    }

    if (dueDate) {
      filter.dueDate = {
        $lte: dayjs(dueDate as string)
          .endOf("day")
          .toDate(),
      };
    }

    if (location) {
      filter.location = { $regex: location as string, $options: "i" };
    }

    let sort: { [key: string]: any } = {};
    if (sortBy) {
      sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;
    const total = await Project.countDocuments(filter);

    const projects = await Project.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({ projects, total });
  } catch (err) {
    console.error("Error retrieving projects:", err);
    res.status(500).json({
      message: `Unable to retrieve projects: ${err}`,
    });
  }
};

export const getProjectsByOwnerId = async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;
    const projects = await Project.find({ "owner._id": ownerId });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
