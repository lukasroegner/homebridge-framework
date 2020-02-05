
import { HomebridgePlatformRegistration } from './homebridge-platform-registration';
import { Accessory } from 'hap-nodejs';

/**
 * Represents the base class for a platform on homebridge. It exposes the homebridge API, logging, configuration and lifecycle events.
 */
export abstract class HomebridgePlatform<TConfiguration> {

    /**
     * Is called when the platform is registered.
     * @param registration The registration object that is created during platform registration.
     */
    public register(registration: HomebridgePlatformRegistration<TConfiguration>) {
        if (registration.api == null || registration.configuration == null || registration.logger == null) {
            throw new Error("Error while registering the platform.");
        }

        // Sets the api, logger and configuration
        this._api = registration.api;
        this._logger = registration.logger;
        this._configuration = registration.configuration;
        this._cachedAccessories = registration.cachedAccessories;

        // Subscribes for the events of the API
        this.api.on('didFinishLaunching', async () => {

            // Calls the initialize function
            const result = this.initialize();
            if (result instanceof Promise) {
                await result;
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
    private _api: HomebridgeApi|null = null;

    /**
     * Gets the homebridge API.
     */
    public get api(): HomebridgeApi {
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
    private _cachedAccessories: Array<Accessory>|null = null;

    /**
     * Gets the cached accessories.
     */
    public get cachedAccessories(): Array<Accessory> {
        if (this._cachedAccessories == null) {
            throw new Error("The platform has not been registered yet.");
        }
        return this._cachedAccessories;
    }
}