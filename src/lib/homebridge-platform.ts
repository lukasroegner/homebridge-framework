
import { PlatformAccessory, Logger, API } from 'homebridge';
import { HomebridgePlatformRegistration } from './homebridge-platform-registration';
import { Accessory } from './accessory';
import { Categories as Category } from 'hap-nodejs';

/**
 * Represents the base class for a platform on homebridge. It exposes the homebridge API, logging, configuration and lifecycle events.
 */
export abstract class HomebridgePlatform<TConfiguration> {

    /**
     * Is called when the platform is registered.
     * @param registration The registration object that is created during platform registration.
     * @internal
     */
    public register(registration: HomebridgePlatformRegistration<TConfiguration>) {
        if (registration.api == null || registration.logger == null) {
            throw new Error("Error while registering the platform.");
        }

        // Checks if a configuration is provided, i.e. the plugin should be loaded
        if (registration.configuration == null) {
            return;
        }

        // Sets the api, logger and configuration
        this._api = registration.api;
        this._logger = registration.logger;
        this._configuration = registration.configuration;
        this._cachedPlatformAccessories = registration.cachedPlatformAccessories;

        // Subscribes for the events of the API
        this.api.on('didFinishLaunching', async () => {

            // Calls the initialize function
            const result = this.initialize();
            if (result instanceof Promise) {
                await result;
            }

            // Removes accessories that are unused at this point
            this.removeUnusedAccessories();

            // Removes services that are unused at this point
            for (let accessory of this.accessories) {
                accessory.removeUnusedServices();
            }

            // Publishes the external accessories, which must be done at this point, as all services and characteristics have to be configured before publishing
            if (this.accessories.some(a => a.isExternal)) {
                this.api.publishExternalAccessories(this.pluginName, this.accessories.filter(a => a.isExternal).map(a => a.platformAccessory));
            }
        });
        this.api.on('shutdown', async () => {

            // Calls the destroy function
            const result = this.destroy();
            if (result instanceof Promise) {
                await result;
            }
        })
    }

    /**
     * Is called when the platform is registered and cached accessories are loaded. Overwrite this function to add new accessories.
     * @returns Returns either void or a promise if you want to intialize accessories asynchronously.
     */
    public initialize(): Promise<void>|void { }

    /**
     * Is called when the platform is destroyed and homebridge is shut down. Overwrite this function to close open connections.
     * @returns Returns either void or a promise if you want to close connections asynchronously.
     */
    public destroy(): Promise<void>|void { }

    /**
     * Gets the name of the plugin. This should be the same name as the NPM package.
     */
    public abstract get pluginName(): string;

    /**
     * Gets the name of the platform. This name is used in the config.json file to identify the platform.
     */
    public abstract get platformName(): string;

    /**
     * Contains the homebridge API.
     */
    private _api: API|null = null;

    /**
     * Gets the homebridge API.
     * @internal
     */
    public get api(): API {
        if (this._api == null) {
            throw new Error("The platform has not been registered yet.");
        }
        return this._api;
    }

    /**
     * Contains the logger.
     */
    private _logger: Logger|null = null;

    /**
     * Gets the logger.
     */
    public get logger(): Logger {
        if (this._logger == null) {
            throw new Error("The platform has not been registered yet.");
        }
        return this._logger;
    }

    /**
     * Contains the platform configuration.
     */
    private _configuration: TConfiguration|null = null;

    /**
     * Gets the platform configuration.
     */
    public get configuration(): TConfiguration {
        if (this._configuration == null) {
            throw new Error("The platform has not been registered yet.");
        }
        return this._configuration;
    }

    /**
     * Contains the cached accessories.
     */
    private _cachedPlatformAccessories: Array<PlatformAccessory>|null = null;

    /**
     * Gets the cached accessories.
     * @internal
     */
    public get cachedPlatformAccessories(): Array<PlatformAccessory> {
        if (this._cachedPlatformAccessories == null) {
            throw new Error("The platform has not been registered yet.");
        }
        return this._cachedPlatformAccessories;
    }

    /**
     * Contains the accessories.
     */
    private _accessories: Array<Accessory> = new Array<Accessory>();

    /**
     * Gets the accessories.
     */
    public get accessories(): Array<Accessory> {
        return this._accessories;
    }

    /**
     * Defines an accessory for usage with the platform. When defining an accessory, it is marked as used and thus not removed from HomeKit after the initialization.
     * @param name The name that should be displayed in HomeKit.
     * @param id The identifier of the accessory.
     * @param subType The sub type of the accessory. May be omitted if the ID is already unique.
     * @param category The category of the accessory, which determines the icon in the Apple Home app.
     * @param isExternal Determines whether the accessory is an external accessory (in contrast to bridged accessories).
     */
    public useAccessory(name: string, id: string, subType?: string, category?: Category, isExternal?: boolean): Accessory {

        // Checks if the accessory has already been defined for usage
        let accessory = this.accessories.find(a => a.id === id && a.subType === (subType || null));
        if (accessory) {
            return accessory;
        }

        // Creates a new accessory and returns it
        accessory = new Accessory(this, name, id, subType, category, isExternal);
        this.accessories.push(accessory);
        return accessory;
    }

    /**
     * Defines an external accessory for usage with the platform.
     * @param name The name that should be displayed in HomeKit.
     * @param id The identifier of the accessory.
     * @param subType The sub type of the accessory. May be omitted if the ID is already unique.
     * @param category The category of the accessory, which determines the icon in the Apple Home app.
     */
    public useExternalAccessory(name: string, id: string, subType?: string, category?: Category): Accessory {
        return this.useAccessory(name, id, subType, category, true);
    }

    /**
     * Unregisters all cached accessories that have not been defined for usage.
     */
    public removeUnusedAccessories() {
        this.api.unregisterPlatformAccessories(this.pluginName, this.platformName, this.cachedPlatformAccessories.filter(c => !this.accessories.some(d => c.context.id === d.id && c.context.subType === d.subType)));
    }
}
