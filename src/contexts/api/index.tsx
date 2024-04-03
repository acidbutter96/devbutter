"use client"

import { fetchFilesInDirectory } from "@/services/stacksService";
import React, { createContext, useContext } from "react"
import { IApiContext, IGetStacks } from "./interfaces";



const ApiContext = createContext({} as IApiContext)

const ApiContextProvider = ({ children }: Readonly<{
    children: React.ReactNode;
}>): React.JSX.Element => {
    const getFileNames = async (
        directory: string,
        exceptions: IGetStacks["exceptions"] = null,
    ) => await fetchFilesInDirectory(directory, exceptions)
    return <ApiContext.Provider
        value={{
            getFileNames,
        }}
    >
        {children}
    </ApiContext.Provider>
}

export default ApiContextProvider

export const useNextApi = () => useContext(ApiContext)