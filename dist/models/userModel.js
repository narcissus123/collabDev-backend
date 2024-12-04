var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
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
}, {
    timestamps: true
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        try {
            // Hash the password when password is modified
            this.password = yield bcrypt.hash(this.password, 12);
            next();
        }
        catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            }
            next();
        }
    });
});
const User = mongoose.model("User", userSchema);
export default User;
