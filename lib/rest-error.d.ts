import { IResponse, IRequest, IResponseFilter } from "./interfaces";
export default class RestError<TError, TResponse = any> extends Error {
    isRestError: boolean;
    request?: IRequest;
    response?: IResponse<TResponse>;
    code: string | number;
    data?: TError;
    constructor(errorCode: string | number, message: string);
    private decorateErrorMessage;
    consoleTable(...tabularData: any[]): this;
    consoleWarn(message: string): this;
    consoleError(message: string): this;
    setRequest(request: IRequest): this;
    setResponse(response: IResponse<any>): this;
    throwFilterMatch(flt: IResponseFilter<any, TError>): boolean;
}
