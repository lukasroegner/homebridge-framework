
import { Accessory } from "hap-nodejs";

/**
 * Represents the registration object of the platform.
 */
export class HomebridgePlatformRegistration<TConfiguration> {

    /**
     * Gets or sets the homebridge API.
     */
    public api: HomebridgeApi|null = null;

    /**
     * Gets or sets the logger.
     */
    public logger: Logger|null = null;

    /**
     * Gets or sets the platform configuration.
     */
    public configuration: TConfiguration|null = null;

    /**
     * Gets or sets the cached accessories.
     */
    public cachedAccessories: Array<Accessory> = new Array<Accessory>();
}
