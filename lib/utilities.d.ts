import { HttpResponseFormat, IRestOptionsQuery, IKeyValue, IResponseAny } from "./interfaces";
export declare function getRequestUrl(host?: string, basePath?: string, path?: string): URL;
export declare function setUrlParameters(url: URL, options: Partial<IRestOptionsQuery>): void;
export declare function transformResponseBody<T>(response?: Response | null, responseType?: HttpResponseFormat): Promise<[boolean, T | null]>;
export declare function transformRequestBody(body: ArrayBuffer | Blob | File | FormData | string | any): string | Blob | ArrayBuffer | FormData;
export declare const resolveAny: IResponseAny;
export declare function cloneObject(obj: IKeyValue): IKeyValue;
export declare function cloneValue(original: IKeyValue, propName: string | number): any;
export declare function mergeObject(target: IKeyValue, mergeWith: IKeyValue): IKeyValue;
export declare function mergeValue(original: IKeyValue, mergeWith: IKeyValue, propName: string): any;
