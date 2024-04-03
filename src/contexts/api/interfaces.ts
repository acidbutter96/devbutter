import { StackListResponse } from "@/pages/api/stackList";

export interface IGetStacks {
    directory: string;
    exceptions: { rule: string; new: string; }[] | null;
}

export interface IApiContext {
    getFileNames: (driectory: IGetStacks["directory"], exceptions: IGetStacks["exceptions"]) => Promise<StackListResponse[]>;
}