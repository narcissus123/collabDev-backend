import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const techStackSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    uniqueErrorMessage: "The project with this title already exists."
  },
  logoStyle: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    required: true
  },
  solution: {
    type: String,
    required: true
  },
  techStack: {
    type: [techStackSchema],
    default: []
  },
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
  contributors: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      name: {
        type: String,
        required: true
      },
      avatar: {
        type: String,
        required: false
      }
    }
  ],
  roles: [
    {
      name: {
        type: String,
        required: true
      },
      requiresCollaborator: {
        type: Boolean,
        required: true
      }
    }
  ],
  location: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    enum: [
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
    ],
    required: true
  },
  status: {
    type: String,
    enum: ["In Progress", "Completed", "Seeking Collaborators"],
    default: "In Progress"
  },
  license: {
    type: String,
    required: false,
    default: ""
  },
  startDate: {
    type: Date,
    required: true,
    trim: true,
    default: () => new Date()
  },
  dueDate: {
    type: Date,
    required: true,
    trim: true,
    default: () => new Date()
  },
  likes: {
    type: Number,
    default: 0
  },
  links: {
    type: [{
      platform: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    }],
    required: true
  },
  coverImage: {
    type: String,
    default: ""
  },
  screenshots: [String],
  sitemap: [String],
  userStories: {
    type: [String],
    required: true
  },
  deliverables: {
    type: [String],
    required: true
  },
  contributionsGuidelines: String,
  dataModel: {
    type: String,
    default: ""
  },
  endpoints: [
    {
      method: String,
      path: String,
      description: String
    }
  ]
});

const Project = mongoose.model("Project", projectSchema);
export default Project;
