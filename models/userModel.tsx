import mongoose from "mongoose";
import { Document } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    avatar: {
      type: String,
      default: ""
    },
    bio: {
      type: String,
      default: ""
    },
    about: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user"
    },
    socialMedia: [{ platform: String, url: String }],
    preferredContact: {
      type: String,
      default: ""
    },
    skills: {
      type: [String],
      default: []
    },
    languages: {
      type: [String],
      default: []
    },
    badges: {
      type: [String],
      default: []
    },
    availability: {
      status: {
        type: String,
        enum: ["Available", "Partially Available", "Unavailable"],
        default: "Available"
      },
      hoursPerDay: {
        type: Number,
        default: 0
      },
      daysPerWeek: {
        type: Number,
        default: 0
      }
    },
    passions: {
      type: [String],
      default: []
    },
    resume: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

type HookNextFunction = () => void;
interface UserDocument extends Document {
  password: string;
}

userSchema.pre<UserDocument>("save", async function (next: HookNextFunction) {
  if (!this.isModified("password")) return next();

  try {
    // Hash the password when password is modified
    this.password = await bcrypt.hash(this.password, 12);

    next();
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
    next();
  }
});

const User = mongoose.model("User", userSchema);

export default User;
