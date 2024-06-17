import { NextFunction, Request, Response } from "express";

// Define a custom middleware function to convert user input
export const userDataConvertor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let updatedUserInput = req.body;
    let files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (req.files && Object.keys(req.files).length > 0) {
      files = {
        ...(req.files as { [fieldname: string]: Express.Multer.File[] }),
      };

      for (const fieldName in files) {
        if (Array.isArray(files[fieldName])) {
          // Extract filenames from badges array
          const filenames: string[] = files[fieldName].map(
            (file: Express.Multer.File) => {
              return file.filename;
            }
          );

          if (updatedUserInput[fieldName]) {
            // If updatedUserInput[fieldName] is not undefined
            updatedUserInput = {
              ...updatedUserInput,
              [fieldName]: [...filenames, ...updatedUserInput[fieldName]],
            };
          } else {
            // If updatedUserInput[fieldName] is undefined
            updatedUserInput = {
              ...updatedUserInput,
              [fieldName]: filenames,
            };
          }
        }
      }
    }

    for (const key in updatedUserInput) {
      if (typeof updatedUserInput[key] === "string") {
        try {
          updatedUserInput[key] = JSON.parse(updatedUserInput[key]);
        } catch (error) {
          console.error(`Error parsing JSON for key ${key}:`, error);
        }
      }
    }

    req.body = updatedUserInput;
    next();
  } catch (error) {
    res.status(500).json({
      message: `Error in data conversion middleware: ${error}`,
    });
  }
};
