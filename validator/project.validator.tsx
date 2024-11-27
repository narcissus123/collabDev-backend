import joi from "joi";
import { ObjectSchema, CustomHelpers } from "joi";
import Project from "../models/projectModel";

const licenseOptions = [
  "Academic Free License v3.0",
  "Apache license 2.0",
  "Artistic license 2.0",
  "Boost Software License 1.0",
  "BSD 2-clause 'Simplified' license",
  "BSD 3-clause 'New' or 'Revised' license",
  "BSD 3-clause Clear license",
  "BSD 4-clause 'Original' or 'Old' license",
  "BSD Zero-Clause license",
  "Creative Commons license family",
  "Creative Commons Zero v1.0 Universal",
  "Creative Commons Attribution 4.0",
  "Creative Commons Attribution ShareAlike 4.0",
  "Do What The F*ck You Want To Public License",
  "Educational Community License v2.0",
  "Eclipse Public License 1.0",
  "Eclipse Public License 2.0",
  "European Union Public License 1.1",
  "GNU Affero General Public License v3.0",
  "GNU General Public License family",
  "GNU General Public License v2.0",
  "GNU General Public License v3.0",
  "GNU Lesser General Public License family",
  "GNU Lesser General Public License v2.1",
  "GNU Lesser General Public License v3.0",
  "ISC",
  "LaTeX Project Public License v1.3c",
  "Microsoft Public License",
  "MIT",
  "Mozilla Public License 2.0",
  "Open Software License 3.0",
  "PostgreSQL License",
  "SIL Open Font License 1.1",
  "University of Illinois/NCSA Open Source License",
  "The Unlicense",
  "zLib License"
];

// Check if a project with the same title already exists
const isUniqueTitle = async (value: string, helpers: CustomHelpers) => {
  try {
    const existingProject = await Project.findOne({ title: value });
    if (existingProject) {
      return helpers.error("any.custom");
    }

    return value;
  } catch (error: unknown) {
    const err = error as Error;
    throw new Error(err.message);
  }
};

const ownerSchema = joi.object({
  _id: joi.string().required(),
  name: joi.string().required(),
  avatar: joi.string().required()
});

const contributorsSchema = joi.object({
  _id: joi.string(),
  name: joi.string(),
  avatar: joi.string()
});

const endpointSchema = joi.object({
  method: joi.string(),
  path: joi.string(),
  description: joi.string()
});

const rolesSchema = joi.object({
  name: joi.string(),
  requiresCollaborator: joi.boolean()
});

const techStackSchema = joi.object({
  id: joi.string().guid({ version: "uuidv4" }),
  label: joi.string(),
  value: joi.string()
});

export const schema: ObjectSchema = joi.object({
  title: joi.string().required().custom(isUniqueTitle).messages({
    "any.required": "Title is required!!!!",
    "string.empty": "Title cannot be empty.",
    "any.custom": "Project name must be unique."
  }),
  description: joi.string().required().messages({
    "any.required": "Description is required.",
    "string.empty": "Description cannot be empty."
  }),
  solution: joi.string().required().messages({
    "any.required": "Detailed description is required.",
    "string.empty": "Detailed description cannot be empty."
  }),
  techStack: joi.array().items(techStackSchema).required().messages({
    "any.required": "Tech stack is required.",
    "array.includesRequiredUnknowns":
      "Tech stack must be an array of objects with id, label, and value."
  }),
  owner: ownerSchema.required().messages({
    "any.required": "Owner information is required."
  }),
  contributors: joi.array().items(contributorsSchema).optional(),
  roles: joi.array().items(rolesSchema).required().messages({
    "any.required": "Role cannot be empty."
  }),
  location: joi.string().optional(),
  category: joi
    .string()
    .valid(
      "Technology",
      "Education",
      "Health and Fitness",
      "Art",
      "Finance",
      "Social Networking",
      "Software Development",
      "Science and Research",
      "Environmental and Sustainability",
      "Entertainment and Media",
      "Gaming",
      "Non-Profit and Community",
      "Travel and Hospitality",
      "Agriculture and Food",
      "Retail and E-commerce",
      "Legal and Governance",
      "Others"
    )
    .required()
    .messages({
      "any.required": "Category is required."
    }),
  status: joi
    .string()
    .valid("In Progress", "Completed", "Seeking Collaborators")
    .messages({
      "any.only": "Invalid status value."
    }),
  license: joi
    .string()
    .valid(...licenseOptions)
    .required()
    .messages({
      "any.required": "License is required."
    }),
  startDate: joi.date().required().messages({
    "any.required": "Start date is required."
  }),
  dueDate: joi.date().allow(null),
  likes: joi.number().min(0).messages({
    "number.min": "Likes must be a non-negative number."
  }),
  links: joi.array().items(joi.string()).required().messages({
    "any.required": "Links are required.",
    "array.includesRequiredUnknowns": "Links must be an array of strings."
  }),
  coverImage: joi.array().items(joi.string()).messages({
    "array.includesRequiredUnknowns": "Cover image must be an array of strings."
  }),
  screenshots: joi.array().items(joi.string()).messages({
    "array.includesRequiredUnknowns": "Screenshots must be an array of strings."
  }),
  sitemap: joi.array().items(joi.string()).required().messages({
    "any.required": "Sitemap is required."
  }),
  userStories: joi.array().items(joi.string()).required().messages({
    "any.required": "User stories are required."
  }),
  deliverables: joi.array().items(joi.string()).required().messages({
    "any.required": "Deliverables are required."
  }),
  contributionsGuidelines: joi.string().allow("").optional().messages({
    "string.empty": "Contribution guidelines must be a string."
  }),
  dataModel: joi.string().allow("").optional().messages({
    "string.empty": "Data model must be a string!!."
  }),
  endpoints: joi.array().items(endpointSchema).optional().messages({
    "array.includesRequiredUnknowns": "Endpoints must be an array of strings."
  })
});
