import { Request, Response, NextFunction } from "express";
import { schema } from "../validator/project.validator";

// Middleware for validating project form input
export const projectsValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = schema.validate(req.body, { abortEarly: false });

  if (result.error) {
    const errorMessages = result.error.details.map(
      (error: { message: unknown }) => error.message
    );
    return res.status(400).json({
      error: errorMessages
    });
  }

  next();
};
