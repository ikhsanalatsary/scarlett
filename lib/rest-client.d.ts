import { IRestOptions, IResponse, HttpMethod, IRestOptionsGlobals } from './interfaces';
import { RestOptions } from "./rest-options";
export default class RestClient {
    private _cache;
    options: RestOptions;
    constructor(options?: Partial<IRestOptionsGlobals>);
    protected cacheKey(url: URL, method?: HttpMethod | "*", customKey?: string): string;
    protected cacheClear(): void;
    protected cacheClearByKey(cacheKey?: string | null): void;
    protected cacheSet(response: IResponse<any>, customKey?: string): void;
    protected cacheGet<TResponse>(url: URL, method?: HttpMethod | "*", customKey?: string): IResponse<TResponse, any> | null | undefined;
    get<TResponse, TError = any>(path: string, overrides?: Partial<IRestOptions>): Promise<IResponse<TResponse, TError>>;
    delete<TResponse, TError = any>(path: string, overrides?: Partial<IRestOptions>): Promise<IResponse<TResponse, TError>>;
    post<TResponse, TError = any>(path: string, overrides?: Partial<IRestOptions>): Promise<IResponse<TResponse, TError>>;
    put<TResponse, TError = any>(path: string, overrides?: Partial<IRestOptions>): Promise<IResponse<TResponse, TError>>;
    patch<TResponse, TError = any>(path: string, overrides?: Partial<IRestOptions>): Promise<IResponse<TResponse, TError>>;
    protected optionsOverride(overrides?: Partial<IRestOptions>, base?: Partial<IRestOptions>): import("./interfaces").IKeyValue;
    request<TResponse, TError = any>(method: HttpMethod, path: string, requestOptions?: Partial<IRestOptions>): Promise<IResponse<TResponse, TError>>;
}
