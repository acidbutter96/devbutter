import { StackListResponse } from "@/pages/api/stackList";
import axios from "axios"

export const fetchFilesInDirectory = async (
    directory: string,
    exceptions: { rule: string, new: string }[] | null = null,
): Promise<StackListResponse[]> => {
    try {
        const response = await axios.post<StackListResponse[]>(
            '/api/stackList', { directory, exceptions }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

