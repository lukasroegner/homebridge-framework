
import { Service as HapService, Characteristic as HapCharacteristic } from 'hap-nodejs';

/**
 * Represents the interface of the HAP API.
 */
export declare interface Hap {

    /**
     * Gets the UUID helpers.
     */
    uuid: {
        generate: (seed: string) => string
    };

    /**
     * Gets the service type.
     */
    Service: typeof HapService;

    /**
     * Gets the characteristic type.
     */
    Characteristic: typeof HapCharacteristic;
}
