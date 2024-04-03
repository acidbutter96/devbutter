import { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import { pathIsValid } from "@/errors/pages/api/fileList"
import fs from "fs"
import { capitalizeString } from "@/utils/capitalizeString"

interface StackListRequest extends NextApiRequest {
    body: {
        directory: string;
        exceptions: {
            rule: string;
            new: string;
        }[] | [];
    };
}


export interface StackListResponse {
    title: string;
    link?: string;
    src: string;
}

export default async function handler(req: StackListRequest, res: NextApiResponse<StackListResponse | {}>) {
    let fileDirectory: string = "public/static/images/stacks/";
    let fileExceptions: StackListRequest["body"]["exceptions"] = [];

    if (req.method == "POST") {
        fileDirectory = req.body.directory ?? fileDirectory;
        fileExceptions = req.body.exceptions?? fileExceptions;
    }
    const error = pathIsValid(fileDirectory)
    if (!error.status) {
        res.status(500).json(error.err ?? {})
    }

    try {
        const directoryPath = path.resolve(process.cwd(), fileDirectory);
        
        fs.readdir(directoryPath, (err, files) => {
            let response: StackListResponse[] = []
            if (err) {
                console.error('Error reading directory:', err, process.cwd());
                return
            }

            const fileList = files.filter(file => {
                return fs.statSync(path.join(directoryPath, file)).isFile();
            })

            if (fileDirectory.includes("./public")) {
                fileDirectory = fileDirectory.split("./public")[1]??fileDirectory
            }

            fileList.forEach((file) => {
                response.push({
                    title: capitalizeString(file, fileExceptions),
                    link: "/",
                    src: `${fileDirectory}${file}`
                })
            })

            res.status(200).json(response);
        });

    } catch (error) {
        res.status(500).json({ error: 'Error reading directory' });
    }
}