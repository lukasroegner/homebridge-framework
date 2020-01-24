
import { HomebridgeAccessoryHandler } from "./HomebridgeAccessoryHandler";

/**
 * Represents the base class for the platform of a plugin.
 */
export class HomebridgePlatform {
    constructor(homebridge: Homebridge) {
        console.log("HomebridgePlatform constructor");
        console.log(homebridge);

        const handler = new HomebridgeAccessoryHandler();
        handler.test();
    }
}
