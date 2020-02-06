
import { PlatformAccessory } from './platform-accessory';

/**
 * Represents the interface of the homebridge API.
 */
export declare interface HomebridgeApi {

    /**
     * Registers a new platform to homebridge.
     * @param pluginName The name of the plugin.
     * @param platformName The name of the platform.
     * @param constructor The constructor of the platform class.
     * @param isDynamicPlatform Determines whether the plaform is dynamic, i.e. can add accessories on the fly.
     */
    registerPlatform(pluginName: string, platformName: string, constructor: any, isDynamicPlatform: boolean): void;

    /**
     * Is called to register a new event handler.
     * @param eventName The name of the event.
     * @param handler The handler of the event.
     */
    on(eventName: 'didFinishLaunching' | 'shutdown', handler: () => void): void;

    /**
     * Registers multiple accessories for homebridge.
     * @param pluginName The name of the plugin.
     * @param platformName The name of the platform.
     * @param accessories An array of accessories that are to be registered.
     */
    registerPlatformAccessories(pluginName: string, platformName: string, accessories: Array<PlatformAccessory>): void;

    /**
     * Unregisters multiple accessories for homebridge.
     * @param pluginName The name of the plugin.
     * @param platformName The name of the platform.
     * @param accessories An array of accessories that are to be unregistered.
     */
    unregisterPlatformAccessories(pluginName: string, platformName: string, accessories: Array<PlatformAccessory>): void;

    /**
     * Gets or sets the constructor for platform accessories.
     */
    platformAccessory: any;

    /**
     * Gets or sets the HAP API.
     */
    hap: {
        uuid: {
            generate: (seed: string) => string
        }
    };
}
