import { IRestOptions, IRestOptionsGlobals } from './interfaces';
import RestClient from '.';
export declare class RestOptions {
    private _options;
    private _restFactory;
    constructor(options?: Partial<IRestOptionsGlobals>, factoryClass?: typeof RestClient);
    private checkAndRestoreDefaults;
    current(): import("./interfaces").IKeyValue;
    setFactory(factoryClass: typeof RestClient): this;
    createRestClient<T extends RestClient>(): T;
    get<K extends keyof IRestOptionsGlobals>(key: K): IRestOptionsGlobals[K];
    set<K extends keyof IRestOptionsGlobals>(key: K, val: IRestOptionsGlobals[K]): this;
    unset<K extends keyof IRestOptions>(key: K): this;
    clone(): RestOptions;
    merge(obj?: Partial<IRestOptions>): this;
    assign(obj?: Partial<IRestOptions>): this;
}
