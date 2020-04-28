
import { PlatformAccessory } from 'homebridge';
import { HomebridgePlatform } from './homebridge-platform';
import { Service } from './service';
import { Service as HapService } from 'hap-nodejs';
import { AccessoryInformation } from './accessory-information';

/**
 * Represents a wrapper around HAP accessories with with support for auto-removal of unused services.
 */
export class Accessory {

    /**
     * Initializes a new Accessory instance.
     * @param platform The homebridge platform.
     * @param name The name that should be displayed in HomeKit.
     * @param id The identifier of the accessory.
     * @param subType The sub type of the accessory. May be omitted if the ID is already unique.
     */
    constructor(platform: HomebridgePlatform<any>, name: string, id: string, subType?: string) {
        this._platform = platform;
        this._name = name;
        this._id = id;
        this._subType = subType || null;

        // Checks if the accessory has been cached
        const platformAccessory = this.platform.cachedPlatformAccessories.find(a => a.context.id === id && a.context.subType === (subType || null));
        if (platformAccessory) {
            this._platformAccessory = platformAccessory;
            return;
        }

        // Creates the new accessory
        this._platformAccessory = new this.platform.api.platformAccessory(name, this.platform.api.hap.uuid.generate(this.uniqueId)) as PlatformAccessory;
        this.platformAccessory.context.id = id;
        this.platformAccessory.context.subType = (subType || null);

        // Registers the accessory
        this.platform.api.registerPlatformAccessories(this.platform.pluginName, this.platform.platformName, [this.platformAccessory]);
    }

    /**
     * Contains the parent platform.
     */
    private _platform: HomebridgePlatform<any>;

    /**
     * Gets the parent platform.
     * @internal
     */
    public get platform(): HomebridgePlatform<any> {
        return this._platform;
    }

    /**
     * Contains the platform accessory.
     */
    private _platformAccessory: PlatformAccessory;

    /**
     * Gets the platform accessory.
     * @internal
     */
    public get platformAccessory(): PlatformAccessory {
        return this._platformAccessory;
    }

    /**
     * Contains the name that should be displayed in HomeKit.
     */
    private _name: string;

    /**
     * Gets the name that should be displayed in HomeKit.
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Contains the identifier of the accessory. Is unique in combination with the sub type.
     */
    private _id: string;

    /**
     * Gets the identifier of the accessory. Is unique in combination with the sub type.
     */
    public get id(): string {
        return this._id;
    }

    /**
     * Contains the sub type of the accessory. Is unique in combination with the ID.
     */
    private _subType: string|null;

    /**
     * Gets the sub type of the accessory. Is unique in combination with the ID.
     */
    public get subType(): string|null {
        return this._subType;
    }

    /**
     * Gets the unique identifier of the accessory, which is made up from the ID and the sub type.
     */
    public get uniqueId(): string {
        return `${this.id}-${(this.subType || '')}`;
    }

    /**
     * Updates the accessory information service.
     * @param information The accessory information.
     */
    public setInformation(information: AccessoryInformation) {

        // Makes sure the accessory information service is used
        const accessoryInformationService = this.useService(this.platform.api.hap.Service.AccessoryInformation, this.name);
        
        // Updates the information characteristics
        if (information.manufacturer != null) {
            accessoryInformationService.useCharacteristic(this.platform.api.hap.Characteristic.Manufacturer, information.manufacturer);
        }
        if (information.model != null) {
            accessoryInformationService.useCharacteristic(this.platform.api.hap.Characteristic.Model, information.model);
        }
        if (information.serialNumber != null) {
            accessoryInformationService.useCharacteristic(this.platform.api.hap.Characteristic.SerialNumber, information.serialNumber);
        }
        if (information.firmwareRevision != null) {
            accessoryInformationService.useCharacteristic(this.platform.api.hap.Characteristic.FirmwareRevision, information.firmwareRevision);
        }
        if (information.hardwareRevision != null) {
            accessoryInformationService.useCharacteristic(this.platform.api.hap.Characteristic.HardwareRevision, information.hardwareRevision);
        }
    }

    /**
     * Contains the services.
     */
    private _services: Array<Service> = new Array<Service>();

    /**
     * Gets the services.
     */
    public get services(): Array<Service> {
        return this._services;
    }

    /**
     * Defines a service for usage with the accessory. When defining a service, it is marked as used and thus not removed from HomeKit after the initialization.
     * @param type The type of the service.
     * @param name The name that should be displayed in HomeKit.
     * @param subType The sub type of the service. May be omitted if the type is already unique.
     */
    public useService(type: typeof HapService, name: string, subType?: string): Service {

        // Checks if the service has already been defined for usage
        let service = this.services.find(s => s.type === type && s.subType === (subType || null));
        if (service) {
            return service;
        }

        // Creates a new service and returns it
        service = new Service(this, type, name, subType);
        this.services.push(service);
        return service;
    }

    /**
     * Removes all cached services that have not been defined for usage.
     */
    public removeUnusedServices() {
        const services = this.platformAccessory.services.slice();
        for (let service of services) {

            // The accessory information service is always required
            if (service.UUID === this.platform.api.hap.Service.AccessoryInformation.UUID) {
                continue;
            }

            // Removes the unused services
            if (service.subtype) {
                if (!this.services.some(d => service.UUID === d.hapService.UUID && service.subtype === d.hapService.subtype)) {
                    this.platformAccessory.removeService(service);
                }
            } else {
                if (!this.services.some(d => service.UUID === d.hapService.UUID && !d.hapService.subtype)) {
                    this.platformAccessory.removeService(service);
                }
            }
        }
    }
}
