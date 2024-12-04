import { schema } from "../validator/project.validator.js";
// Middleware for validating project form input
export const projectsValidator = (req, res, next) => {
    const result = schema.validate(req.body, { abortEarly: false });
    if (result.error) {
        const errorMessages = result.error.details.map((error) => error.message);
        return res.status(400).json({
            error: errorMessages
        });
    }
    next();
};
