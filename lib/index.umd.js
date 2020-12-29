(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.scarlett = {}));
}(this, (function (exports) { 'use strict';

    class RestError extends Error {
        constructor(errorCode, message) {
            super(message);
            this.isRestError = true;
            this.code = "";
            this.code = errorCode;
            this.message = this.decorateErrorMessage(message);
        }
        decorateErrorMessage(message) {
            return `[${this.code}] ${message}`;
        }
        consoleTable(...tabularData) {
            console.table(...tabularData);
            return this;
        }
        consoleWarn(message) {
            console.warn(this.decorateErrorMessage(message));
            return this;
        }
        consoleError(message) {
            console.error(this.decorateErrorMessage(message));
            return this;
        }
        setRequest(request) {
            this.request = request;
            return this;
        }
        setResponse(response) {
            this.response = response;
            this.data = response.data;
            return this;
        }
        throwFilterMatch(flt) {
            if (!this.request || !this.response)
                return false;
            return (!flt.path || this.request.url.href.indexOf(flt.path) > -1)
                && (!flt.method || flt.method.toLowerCase() === this.request.method.toLowerCase())
                && (!flt.statusCode || Boolean(flt.statusCode === this.response.status));
        }
    }

    function getRequestUrl(host = location.origin, basePath = "/", path = "/") {
        return new URL(`${basePath !== null && basePath !== void 0 ? basePath : "/"}/${path}`.replace(/\/+/g, "/"), host);
    }
    function setUrlParameters(url, options) {
        const query = options.query;
        if (!query)
            return;
        const transf = options.queryParamsTransormer;
        const keys = Object.keys(query);
        if (typeof transf === "function")
            keys.forEach(key => {
                const value = query[key];
                let newval = transf(key, value, query);
                if (typeof newval == "number")
                    newval = newval.toString();
                const t = typeof newval;
                if (t !== "string" && t !== "undefined" && newval !== null)
                    throw new RestError("ArgumentException", `Invalid type for '${key}' parameter: \r\n${JSON.stringify(newval)}`);
                url.searchParams.delete(key);
                if (newval)
                    url.searchParams.append(key, newval);
                else if (options.queryParamsIncludeEmpty === true)
                    url.searchParams.append(key, "");
            });
        else
            keys.forEach(key => {
                const value = query[key];
                url.searchParams.append(key, value !== null && value !== void 0 ? value : "");
            });
    }
    async function transformResponseBody(response = null, responseType = "json") {
        var _a;
        if (!response)
            return [false, null];
        const isResponseChunked = response.headers.get("Transfer-Encoding") === 'chunked';
        const responseSize = parseInt((_a = response.headers.get("Content-Length")) !== null && _a !== void 0 ? _a : "");
        if (response.status === 204 || isResponseChunked)
            return [true, null];
        try {
            return [true, await response[responseType]()];
        }
        catch (error) {
            return [false, null];
        }
    }
    function transformRequestBody(body) {
        return (globalThis.ArrayBuffer && body instanceof ArrayBuffer && body.byteLength !== undefined ? body
            : globalThis.Blob && body instanceof Blob ? body
                : globalThis.File && body instanceof File ? body
                    : globalThis.FormData && body instanceof FormData ? body
                        : typeof body === "string" ? body
                            : JSON.stringify(body));
    }
    const resolveAny = (prom) => {
        return new Promise(resolve => {
            prom.then((response) => resolve([response, null]))
                .catch((err) => resolve([null, err]));
        });
    };
    function cloneObject(obj) {
        let cloned = {};
        for (let [key] of Object.entries(obj)) {
            const clonedVal = cloneValue(obj, key);
            cloned[key] = clonedVal;
        }
        return cloned;
    }
    function cloneValue(original, propName) {
        const oldval = original[propName];
        const type = typeof oldval;
        if (!oldval)
            return;
        else if (type === "string")
            return String(oldval);
        else if (type === "number")
            return Number(oldval);
        else if (type === "boolean")
            return Boolean(oldval);
        else if (globalThis.Headers && oldval instanceof Headers)
            return new Headers(oldval);
        else if (globalThis.AbortController && oldval instanceof AbortController)
            return new AbortController();
        else if (globalThis.FormData && oldval instanceof FormData) {
            const cloned = new FormData();
            oldval.forEach((value, key) => cloned.append(key, value));
            return cloned;
        }
        else if (typeof oldval === 'object')
            return cloneObject(oldval);
        else if (Array.isArray(oldval))
            return oldval.map((v, i) => cloneValue(oldval, i));
        return oldval;
    }
    function mergeObject(target, mergeWith) {
        for (let [key] of Object.entries(mergeWith)) {
            const mergedVal = mergeValue(target, mergeWith, key);
            target[key] = mergedVal;
        }
        return target;
    }
    function mergeValue(original, mergeWith, propName) {
        const oldval = original[propName];
        const newval = mergeWith[propName];
        if (typeof newval === "undefined" || newval === null)
            return oldval;
        else if (Array.isArray(newval))
            return oldval ? [...oldval, ...newval] : newval;
        else if (newval instanceof Headers) {
            const headers = oldval;
            if (!headers)
                return newval;
            newval.forEach((hval, hkey) => {
                if (!hval || hval == "null" || hval == "undefined")
                    headers.delete(hkey);
                else
                    headers.set(hkey, hval);
            });
            return headers;
        }
        else if (typeof newval === 'object')
            return mergeObject(oldval !== null && oldval !== void 0 ? oldval : {}, newval);
        return newval;
    }

    class RestOptions {
        constructor(options, factoryClass) {
            this._options = options !== null && options !== void 0 ? options : {};
            this._restFactory = factoryClass !== null && factoryClass !== void 0 ? factoryClass : RestClient;
            this.checkAndRestoreDefaults();
        }
        checkAndRestoreDefaults() {
            if (!this._options.overrideStrategy)
                this._options.overrideStrategy = "merge";
            if (!this._options.abortController)
                this._options.abortController = new AbortController();
            if (!this._options.credentials)
                this._options.credentials = "same-origin";
            if (!this._options.mode)
                this._options.mode = "same-origin";
            if (!this._options.cache)
                this._options.cache = "default";
            if (!this._options.redirect)
                this._options.redirect = "follow";
            if (typeof this._options.referrer == "undefined")
                this._options.referrer = "";
            if (!this._options.referrerPolicy)
                this._options.referrerPolicy = "no-referrer-when-downgrade";
            if (!this._options.throw && this._options.throwExcluding && this._options.throwExcluding.length)
                this._options.throw = true;
            if (!this._options.responseType)
                this._options.responseType = "json";
            if (!this._options.timeout)
                this._options.timeout = 30000;
        }
        current() {
            return cloneObject(this._options);
        }
        setFactory(factoryClass) {
            this._restFactory = factoryClass;
            return this;
        }
        createRestClient() {
            const options = this.clone()._options;
            return new this._restFactory(options);
        }
        get(key) {
            return cloneValue(this._options, key);
        }
        set(key, val) {
            this._options[key] = val;
            return this;
        }
        unset(key) {
            delete this._options[key];
            this.checkAndRestoreDefaults();
            return this;
        }
        clone() {
            const cloned = cloneObject(this._options);
            return new RestOptions(cloned);
        }
        merge(obj) {
            mergeObject(this._options, obj !== null && obj !== void 0 ? obj : {});
            return this;
        }
        assign(obj) {
            Object.assign(this._options, obj !== null && obj !== void 0 ? obj : {});
            return this;
        }
    }

    class RestClient {
        constructor(options) {
            this._cache = new Map();
            this.options = new RestOptions(options !== null && options !== void 0 ? options : {});
        }
        cacheKey(url, method = "*", customKey) {
            var _a;
            const cacheKey = (customKey === null || customKey === void 0 ? void 0 : customKey.trim()) ? customKey : ((_a = this.options.get("cacheKey")) !== null && _a !== void 0 ? _a : '');
            function formDataToObj(formData) {
                let o = {};
                formData.forEach((value, key) => (o[key] = value));
                return o;
            }
            const body = this.options.get("body");
            const responseType = this.options.get("responseType");
            const inputs = body ? (responseType === "json" ? JSON.stringify(body)
                : responseType === "text" ? body
                    : responseType === "formData" ? JSON.stringify(formDataToObj(body))
                        : "") : "";
            return `${cacheKey}|${url.href}|${method}|${inputs}`;
        }
        cacheClear() {
            this._cache.clear();
        }
        cacheClearByKey(cacheKey) {
            if (!cacheKey)
                return;
            for (let key of this._cache.keys())
                if (key.startsWith(`${cacheKey}|`))
                    this._cache.delete(key);
        }
        cacheSet(response, customKey) {
            const key = this.cacheKey(response.request.url, response.request.method, customKey);
            this._cache.set(key, response);
        }
        cacheGet(url, method = "*", customKey) {
            const key = this.cacheKey(url, method, customKey);
            return this._cache.get(key);
        }
        get(path, overrides) {
            return this.request("GET", path, overrides);
        }
        delete(path, overrides) {
            return this.request("DELETE", path, overrides);
        }
        post(path, overrides) {
            return this.request("POST", path, overrides);
        }
        put(path, overrides) {
            return this.request("PUT", path, overrides);
        }
        patch(path, overrides) {
            return this.request("PATCH", path, overrides);
        }
        optionsOverride(overrides, base) {
            const target = base !== null && base !== void 0 ? base : this.options.current();
            if (this.options.get("overrideStrategy") === "merge") {
                let o = cloneObject(target);
                return mergeObject(o, overrides !== null && overrides !== void 0 ? overrides : {});
            }
            else
                return Object.assign({}, target, overrides !== null && overrides !== void 0 ? overrides : {});
        }
        async request(method, path, requestOptions) {
            var _a, _b, _c;
            const that = this;
            const localOptions = requestOptions
                ? this.optionsOverride(requestOptions)
                : this.options.current();
            const url = getRequestUrl(localOptions.host, localOptions.basePath, path);
            if (localOptions.query && Object.keys(localOptions.query).length)
                setUrlParameters(url, localOptions);
            localOptions.cacheKey = (_a = localOptions.cacheKey) === null || _a === void 0 ? void 0 : _a.trim();
            if (localOptions.internalCache) {
                const cachedResponse = this.cacheGet(url, method);
                if (cachedResponse)
                    return cachedResponse;
            }
            const request = {
                method, options: localOptions, url,
                body: localOptions.body
            };
            const onRequest = this.options.get("onRequest");
            if (typeof onRequest == "function")
                onRequest(request);
            const [fetchResponse, fetchError] = await resolveAny(new Promise((resolve, reject) => {
                var _a;
                let timeoutTrigger = false;
                let fetchFullFilled = false;
                const timeoutId = setTimeout(function requestTimeout() {
                    var _a;
                    if (fetchFullFilled)
                        return;
                    timeoutTrigger = true;
                    (_a = localOptions.abortController) === null || _a === void 0 ? void 0 : _a.abort();
                    let timeoutError = new Error();
                    timeoutError.name = "timeout";
                    const seconds = (localOptions.timeout / 1000).toFixed(1).replace(".0", "");
                    timeoutError.message = `Request timeout after ${seconds} second${seconds == "1" ? "" : "s"}.`;
                    reject(timeoutError);
                }, localOptions.timeout);
                const req = {
                    method,
                    body: method === "GET" ? undefined : transformRequestBody(localOptions.body),
                    signal: (_a = localOptions.abortController) === null || _a === void 0 ? void 0 : _a.signal,
                    cache: localOptions.cache,
                    headers: localOptions.headers,
                    credentials: localOptions.credentials,
                    keepalive: localOptions.keepalive,
                    mode: localOptions.mode,
                    redirect: localOptions.redirect,
                    referrerPolicy: localOptions.referrerPolicy,
                    referrer: localOptions.referrer
                };
                fetch(url.href, req).then((response) => {
                    if (!timeoutTrigger)
                        resolve(response);
                })
                    .catch((error) => reject(error))
                    .finally(() => {
                    fetchFullFilled = true;
                    clearTimeout(timeoutId);
                });
            }));
            const [parseOk, data] = await transformResponseBody(fetchResponse, localOptions.responseType);
            const response = {
                fetchResponse: fetchResponse !== null && fetchResponse !== void 0 ? fetchResponse : undefined,
                headers: await (fetchResponse === null || fetchResponse === void 0 ? void 0 : fetchResponse.trailer),
                options: this.options,
                request, data,
                status: fetchResponse === null || fetchResponse === void 0 ? void 0 : fetchResponse.status,
                repeat(m, repeatOptions) {
                    if (arguments.length == 2) {
                        m = (m ? m : method);
                        repeatOptions = (repeatOptions ? repeatOptions : {});
                    }
                    else if (arguments.length == 1) {
                        repeatOptions = (m ? m : {});
                        m = method;
                    }
                    else if (!arguments.length) {
                        m = method;
                        repeatOptions = {};
                    }
                    const newOpts = that.optionsOverride(repeatOptions, localOptions);
                    return that.request(m, path, newOpts);
                }
            };
            if (fetchError) {
                const ser = new RestError(fetchError.name, fetchError.message);
                ser.stack = fetchError.stack;
                if (ser.code === "timeout")
                    response.status = 408;
                ser.setRequest(request);
                ser.setResponse(response);
                response.error = ser;
            }
            else if (!parseOk) {
                const ser = new RestError("BodyParseError", `An error occurred while parsing the response body as ${localOptions.responseType}`);
                ser.setRequest(request);
                ser.setResponse(response);
                response.error = ser;
            }
            else if ((fetchResponse === null || fetchResponse === void 0 ? void 0 : fetchResponse.ok) === false) {
                const ser = new RestError(fetchResponse.status, fetchResponse.statusText);
                ser.setRequest(request);
                ser.setResponse(response);
                response.error = ser;
            }
            if (response.error) {
                const onError = this.options.get("onError");
                if (typeof onError == "function")
                    onError(response.error);
                if (localOptions.throw) {
                    const throwFilterFound = (_c = (_b = localOptions.throwExcluding) === null || _b === void 0 ? void 0 : _b.find((f) => response.error.throwFilterMatch(f))) !== null && _c !== void 0 ? _c : false;
                    if (!throwFilterFound)
                        throw response.error;
                    else {
                        if (typeof throwFilterFound.onFilterMatch === "function")
                            throwFilterFound.onFilterMatch(response.error);
                        response.throwFilter = throwFilterFound;
                    }
                }
            }
            if (localOptions.internalCache)
                this.cacheSet(response);
            const onReponse = this.options.get("onResponse");
            if (typeof onReponse == "function")
                onReponse(response);
            return response;
        }
    }

    exports.RestError = RestError;
    exports.RestOptions = RestOptions;
    exports.default = RestClient;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.umd.js.map
