import RestError from "./rest-error";
import { RestOptions } from "./rest-options";
export interface IKeyValue {
    [key: string]: any;
}
export interface IRestOptionsQuery {
    query: IKeyValue;
    queryParamsTransormer: IQueryParamTransformer;
    queryParamsIncludeEmpty: boolean;
}
export interface IRestOptionsNative {
    abortController: AbortController;
    credentials: RequestCredentials;
    mode: RequestMode;
    keepalive: boolean;
    headers: Headers;
    cache: RequestCache;
    redirect: RequestRedirect;
    referrer: string;
    referrerPolicy: ReferrerPolicy;
}
export interface IRestOptionsProtected {
    overrideStrategy: LocalOverrideStrategy;
}
export interface IRestOptions extends IRestOptionsQuery, IRestOptionsNative {
    host: string;
    basePath: string;
    responseType: HttpResponseFormat;
    body: ArrayBuffer | ArrayBufferView | Blob | File | string | URLSearchParams | FormData | IKeyValue;
    timeout: number;
    internalCache: boolean;
    cacheKey: string;
    throw: boolean;
    throwExcluding: IResponseFilter<any, any>[];
    onRequest(request: IRequest): void;
    onResponse<TResponse = any, TError = any>(response: IResponse<TResponse, TError>): void;
    onError<TError = any, TResponse = any>(error: RestError<TError, TResponse>): void;
}
export interface IRestOptionsGlobals extends IRestOptions, IRestOptionsProtected {
}
export declare type LocalOverrideStrategy = "merge" | "assign";
export interface IRequest {
    options: Partial<IRestOptions>;
    url: URL;
    method: HttpMethod;
    body: any;
}
export interface IResponse<TResponse, TError = any> {
    fetchResponse?: Response;
    request: IRequest;
    error?: RestError<TError, TResponse>;
    status: HTTPStatusCode;
    headers?: Headers;
    data: TResponse | null;
    options: RestOptions;
    throwFilter?: IResponseFilter<TResponse, TError>;
    repeat: IRepeat<TResponse, TError>;
}
export interface IRepeat<TResponse, TError = any> {
    (method: HttpMethod, requestOptions?: Partial<IRestOptions>): Promise<IResponse<TResponse, TError>>;
}
export interface IRepeat<TResponse, TError = any> {
    (requestOptions?: Partial<IRestOptions>): Promise<IResponse<TResponse, TError>>;
}
export interface IResponseFilter<TResponse, TError> {
    path?: string;
    method?: HttpMethod;
    statusCode?: HTTPStatusCode;
    onFilterMatch?: {
        (restError: RestError<TError, TResponse>): void;
    };
}
export interface IQueryParamTransformer {
    (key: string, value: any, query: any): string;
}
export interface IResponseAny {
    <TData = any, TError = any>(prom: Promise<any>): Promise<[TData | null, TError | null]>;
}
export interface IResponseAny {
    <TResponse>(prom: Promise<TResponse>): Promise<[TResponse | null, Error | RestError<any, TResponse> | null]>;
}
export declare type HttpMethod = 'GET' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH' | 'LINK';
export declare type HttpResponseFormat = "json" | "text" | "blob" | "arrayBuffer" | "formData";
export declare const enum HTTPStatusCode {
    Continue = 100,
    SwitchingProtocols = 101,
    Processing = 102,
    EarlyHints = 103,
    InformationalResponses = 103,
    OK = 200,
    Created = 201,
    Accepted = 202,
    NonAuthoritativeInformation = 203,
    NoContent = 204,
    ResetContent = 205,
    PartialContent = 206,
    MultiStatus = 207,
    AlreadyReported = 208,
    IMUsed = 226,
    Success = 255,
    MultipleChoices = 300,
    MovedPermanently = 301,
    Found = 302,
    SeeOther = 303,
    NotModified = 304,
    UseProxy = 305,
    SwitchProxy = 306,
    TemporaryRedirect = 307,
    PermanentRedirect = 308,
    Redirection = 319,
    BadRequest = 400,
    Unauthorized = 401,
    PaymentRequired = 402,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    NotAcceptable = 406,
    ProxyAuthenticationRequired = 407,
    RequestTimeout = 408,
    Conflict = 409,
    Gone = 410,
    LengthRequired = 411,
    PreconditionFailed = 412,
    PayloadTooLarge = 413,
    URITooLong = 414,
    UnsupportedMediaType = 415,
    RangeNotSatisfiable = 416,
    ExpectationFailed = 417,
    ImATeapot = 418,
    MisdirectedRequest = 421,
    UnprocessableEntity = 422,
    Locked = 423,
    FailedDependency = 424,
    UpgradeRequired = 426,
    PreconditionRequired = 428,
    TooManyRequests = 429,
    RequestHeaderFieldsTooLarge = 431,
    UnavailableForLegalReasons = 451,
    ClientErrors = 511,
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,
    HTTPVersionNotSupported = 505,
    VariantAlsoNegotiates = 506,
    InsufficientStorage = 507,
    LoopDetected = 508,
    NotExtended = 510,
    NetworkAuthenticationRequired = 511,
    ServerErrors = 511
}
