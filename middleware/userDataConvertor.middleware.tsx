import { NextFunction, Request, Response } from "express";

const isJSON = (str: unknown) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// Define a custom middleware function to convert user input
export const userDataConvertor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let updatedUserInput = req.body;
    console.log("updatedUserInput", updatedUserInput);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    console.log("files", files);
    if (files && Object.keys(files).length > 0) {
      for (const fieldName in files) {
        // console.log("fieldName", fieldName);
        if (Array.isArray(files[fieldName])) {
          // Extract filenames from badges array
          const filenames: string[] = files[fieldName].map(
            (file: Express.Multer.File) => {
              return file.filename;
            }
          );
          // console.log("filenames", filenames);
          if (updatedUserInput[fieldName]) {
            // If updatedUserInput[fieldName] is not undefined
            updatedUserInput = {
              ...updatedUserInput,
              [fieldName]: [...filenames, ...updatedUserInput[fieldName]]
            };
            // console.log("updatedUserInput1", updatedUserInput);
          } else {
            // If updatedUserInput[fieldName] is undefined
            updatedUserInput = {
              ...updatedUserInput,
              [fieldName]: filenames
            };
            console.log("updatedUserInput2", updatedUserInput);
          }
        }
      }
    }

    for (const key in updatedUserInput) {
      if (
        typeof updatedUserInput[key] === "string" &&
        key !== "avatar" &&
        isJSON(updatedUserInput[key])
      ) {
        updatedUserInput[key] = JSON.parse(updatedUserInput[key]);
        // console.log("key", key);
        // console.log("updatedUserInput-------", updatedUserInput);
        // console.log("updatedUserInput[key]", updatedUserInput[key]);
      }

      if (key === "avatar" && Array.isArray(updatedUserInput[key])) {
        updatedUserInput[key] = updatedUserInput[key][0];
      }
    }
    // console.log("updatedUserInput last", updatedUserInput);
    req.body = updatedUserInput;
    next();
  } catch (error) {
    console.error("Error in data conversion middleware:", error);
    return res.status(500).json({
      message: `Internal server error. Please try again later.`
    });
  }
};
