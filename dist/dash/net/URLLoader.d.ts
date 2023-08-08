import { FactoryObject } from "../../types/dash/Factory";
import { URLConfig, RequestType } from "../../types/dash/Net";
declare class URLLoader {
    private config;
    private xhrLoader;
    private eventBus;
    constructor(ctx: FactoryObject, ...args: any[]);
    private _loadManifest;
    setup(): void;
    load(config: URLConfig, type: RequestType): void;
}
declare const URLLoaderFactory: import("../../types/dash/Factory").FactoryFunction<URLLoader>;
export default URLLoaderFactory;
export { URLLoader };
