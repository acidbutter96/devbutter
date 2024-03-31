import fs from "fs";

export const pathIsValid = (fileDirectory: string): { status: boolean, err?: unknown} => {
    try {
        fs.accessSync(fileDirectory, fs.constants.F_OK);
        return {
            status: true,
        };
    } catch (err){
        return {
            status: false,
            err: err,
        };
    }
}

