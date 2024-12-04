const isJSON = (str) => {
    if (typeof str !== 'string')
        return false;
    try {
        JSON.parse(str);
        return true;
    }
    catch (e) {
        return false;
    }
};
// Define a custom middleware function to convert user input
export const userDataConvertor = (req, res, next) => {
    try {
        let updatedUserInput = req.body;
        const files = req.files;
        if (files && Object.keys(files).length > 0) {
            for (const fieldName in files) {
                if (Array.isArray(files[fieldName])) {
                    // Extract filenames from badges array
                    const filenames = files[fieldName].map((file) => {
                        return file.filename;
                    });
                    if (updatedUserInput[fieldName]) {
                        // If updatedUserInput[fieldName] is not undefined
                        updatedUserInput = Object.assign(Object.assign({}, updatedUserInput), { [fieldName]: [...filenames, ...updatedUserInput[fieldName]] });
                    }
                    else {
                        // If updatedUserInput[fieldName] is undefined
                        updatedUserInput = Object.assign(Object.assign({}, updatedUserInput), { [fieldName]: filenames });
                    }
                }
            }
        }
        for (const key in updatedUserInput) {
            if (typeof updatedUserInput[key] === "string" &&
                key !== "avatar" &&
                isJSON(updatedUserInput[key])) {
                updatedUserInput[key] = JSON.parse(updatedUserInput[key]);
            }
            if (key === "avatar" && Array.isArray(updatedUserInput[key])) {
                updatedUserInput[key] = updatedUserInput[key][0];
            }
        }
        req.body = updatedUserInput;
        next();
    }
    catch (error) {
        console.error("Error in data conversion middleware:", error);
        return res.status(500).json({
            message: `Internal server error. Please try again later.`
        });
    }
};
