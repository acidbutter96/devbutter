export const renameFileToShow = (name: string, exceptions: {rule: string; new: string}[] = []): string => {
    let response: string = "";
    const responseArray: string[] = name.split(".");

    if (!!responseArray.length) {
        for (let i = 0; i < responseArray.length - 1 ; i++){
            response += responseArray[i].charAt(i).toUpperCase() + responseArray[i].slice(1);
            response.replace("-", " ").replace("_", " ");
        }
    } else {
        return "";
    }
    if (!!exceptions.length) {
        response = exceptions.find(exception => exception.rule == responseArray[0])?.new??response;
    }

    return response;
}
