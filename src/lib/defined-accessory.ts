
import { PlatformAccessory } from '../types/platform-accessory';
import { HomebridgePlatform } from './homebridge-platform';
import { DefinedService } from './defined-service';
import { Service } from 'hap-nodejs';

/**
 * Represents a wrapper around accessories with with support for auto-removal of unused services.
 */
export class DefinedAccessory {

    /**
     * Initializes a new DefinedAccessory instance.
     * @param platform The homebridge platform.
     * @param name The name that should be displayed in HomeKit.
     * @param id The identifier of the accessory.
     * @param subType The sub type of the accessory. May be omitted if the ID is already unique.
     */
    constructor(platform: HomebridgePlatform<any>, name: string, id: string, subType?: string) {
        this.platform = platform;
        this._name = name;
        this._id = id;
        this._subType = subType || null;

        // Checks if the accessory has been cached
        const accessory = this.platform.cachedAccessories.find(a => a.context.id === id && a.context.subType === (subType || null));
        if (accessory) {
            this._accessory = accessory;
            return;
        }

        // Creates the new accessory
        this._accessory = new this.platform.api.platformAccessory(name, this.platform.api.hap.uuid.generate(this.uniqueId)) as PlatformAccessory;
        this.accessory.context.id = id;
        this.accessory.context.subType = (subType || null);

        // Registers the accessory and adds it to the defined accessories
        this.platform.api.registerPlatformAccessories(this.platform.pluginName, this.platform.platformName, [this.accessory]);
    }

    /**
     * Contains the parent platform.
     */
    private platform: HomebridgePlatform<any>;

    /**
     * Contains the platform accessory.
     */
    private _accessory: PlatformAccessory;

    /**
     * Gets the platform accessory.
     */
    public get accessory(): PlatformAccessory {
        return this._accessory;
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
     * Contains the defined services.
     */
    private _definedServices: Array<DefinedService> = new Array<DefinedService>();

    /**
     * Gets the defined services.
     */
    public get definedServices(): Array<DefinedService> {
        return this._definedServices;
    }

    /**
     * Defines a service for usage with the accessory. When defining a service, it is marked as used and thus not removed from HomeKit after the initialization.
     * @param type The type of the service.
     * @param name The name that should be displayed in HomeKit.
     * @param subType The sub type of the service. May be omitted if the type is already unique.
     */
    public defineService(type: typeof Service, name: string, subType?: string): DefinedService {

        // Checks if the service has already been defined
        let definedService = this.definedServices.find(s => s.type === type && s.subType === (subType || null));
        if (definedService) {
            return definedService;
        }

        // Creates a new defined service and returns it
        definedService = new DefinedService(this, type, name, subType);
        this.definedServices.push(definedService);
        return definedService;
    }

    /**
     * Removes all cached services that have not been defined.
     */
    public removeUndefinedServices() {
        for (let service of this.accessory.services) {
            if (!this.definedServices.some(d => service.UUID === d.service.UUID)) {
                this.accessory.removeService(service);
            }
        }
    }
}
