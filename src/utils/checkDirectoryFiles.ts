"use server";
import fs from 'fs';
import path from 'path';

const fileList = async (directoryPath: string): Promise<string[]> => {
    let result: string[] = [];

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err, process.cwd());
            return;
        }

        
        const fileList = files.filter(file => {
            console.error(file, path.join(directoryPath, file), fs.statSync(path.join(directoryPath, file)), fs.statSync(path.join(directoryPath, file)).isFile())
            return fs.statSync(path.join(directoryPath, file)).isFile();
        });
        
        fileList.forEach(file => {
            result.push(file);
        });
    });

    return result;
}


export default fileList;