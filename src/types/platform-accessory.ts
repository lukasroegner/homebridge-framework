
import { Accessory, Service } from 'hap-nodejs';

/**
 * Represents the class for accessories that are handled by homebridge.
 */
export declare interface PlatformAccessory extends Accessory {

    /**
     * Gets or sets the persistent context of the accessory.
     */
    context: any;

    /**
     * Searchs for a service in the services collection and returns the first service object that matches.
     * @param type The type of the service.
     * @param subType A subtype string to match.
     * @returns Returns a service if found.
     */
    getServiceByUUIDAndSubType(type: typeof Service, subType: string): Service|undefined;
}
