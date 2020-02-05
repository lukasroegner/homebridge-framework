
declare interface Logger {
    (message: string): void;
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}

declare interface HomebridgeApi {
    registerPlatform(pluginName: string, platformName: string, constructor: any, isDynamicPlatform: boolean): void;
    on(eventName: 'didFinishLaunching' | 'shutdown', handler: () => void): void;
    registerPlatformAccessories(pluginName: string, platformName: string, accessories: Array<any>): void;
    unregisterPlatformAccessories(pluginName: string, platformName: string, accessories: Array<any>): void;
}
