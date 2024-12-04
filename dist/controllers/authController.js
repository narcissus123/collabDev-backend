import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d"
    });
};
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const jwtCookieExpiresIn = process.env.JWT_COOKIE_EXPIRES_IN;
    if (jwtCookieExpiresIn) {
        const expiresInMilliseconds = parseInt(jwtCookieExpiresIn, 10) * 24 * 60 * 60 * 1000;
        const cookieOptions = {
            expires: new Date(Date.now() + expiresInMilliseconds),
            httpOnly: true
        };
        res.cookie("jwt", token, cookieOptions);
    }
    // Remove password from output
    const userWithoutPassword = { ...user.toObject(), password: undefined };
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            userWithoutPassword
        }
    });
};
export const signup = async (req, res) => {
    try {
        if (!req.body.name || !req.body.email || !req.body.password) {
            return res.status(400).json({
                message: "Please provide both email and password."
            });
        }
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });
        if (newUser.availability !== null) {
            createSendToken(newUser, 201, res);
        }
    }
    catch (err) {
        console.error("Error fetching user by ID:", err);
        res.status(500).json({ message: `Internal server error: ${err}` });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password!"
            });
        }
        // Check if user exists && password is correct
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        createSendToken(user, 200, res);
    }
    catch (err) {
        console.error("Error fetching user by ID:", err);
        res.status(500).json({ message: `Internal server error: ${err}` });
    }
};
export const forgetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update the user's password in the database
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
// Custom promisify function for jwt.verify
const verifyJwt = (token, secret) => new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return reject(err);
        }
        resolve(decoded);
    });
});
// Middleware to protect routes:
export const protect = async (req, res, next) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not set in environment variables");
        }
        const secret = process.env.JWT_SECRET || "default_secret";
        // Getting token
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
            if (!token) {
                return res.status(401).json({
                    message: `You are not logged in! Please log in to get access.`
                });
            }
            // Verify token
            const decoded = (await verifyJwt(token, secret));
            // Check if user with the target token still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return res.status(401).json({
                    message: `The user belonging to this token does no longer exist.`
                });
            }
            // Give access to protected routes
            req.authenticatedUser = currentUser;
            return next();
        }
        return res.status(401).json({
            message: "You are not logged in! Please log in to get access."
        });
    }
    catch (error) {
        const err = error;
        console.error("Error in protect middleware:", err);
        return res.status(500).json({
            message: `Internal server error: ${err.message}`
        });
    }
};
