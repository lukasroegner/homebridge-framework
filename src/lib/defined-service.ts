
import { DefinedAccessory } from './defined-accessory';
import { Service, WithUUID } from 'hap-nodejs';

/**
 * Represents a wrapper around services with with support for auto-removal of unused characteristics.
 */
export class DefinedService {

    /**
     * Initializes a new DefinedService instance.
     * @param definedAccessory The defined accessory.
     * @param type The type of the service.
     * @param name The name that should be displayed in HomeKit.
     * @param subType The sub type of the service. May be omitted if the type is already unique.
     */
    constructor(definedAccessory: DefinedAccessory, type: typeof Service, name: string, subType?: string) {
        this.definedAccessory = definedAccessory;
        this._type = type;
        this._name = name;
        this._subType = subType || null;

        // Checks if the service has been cached
        let service: Service|null = null;
        if (this.subType != null) {
            service = this.definedAccessory.accessory.getServiceByUUIDAndSubType(this.type, this.subType) || null;
        } else {
            service = this.definedAccessory.accessory.getService(<WithUUID<typeof Service>>this.type) || null;
        }
        if (service) {
            this._service = service;
            return;
        }

        // Creates the new service
        this._service = this.definedAccessory.accessory.addService(this.type, this.name, this.subType);
    }

    /**
     * Contains the parent defined accessory.
     */
    private definedAccessory: DefinedAccessory;

    /**
     * Contains the service.
     */
    private _service: Service;

    /**
     * Gets the platform accessory.
     */
    public get service(): Service {
        return this._service;
    }

    /**
     * Contains the type of the service.
     */
    private _type: typeof Service;

    /**
     * Gets the type of the service.
     */
    public get type(): typeof Service {
        return this._type;
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
     * Contains the sub type of the service. May be omitted if the type is already unique.
     */
    private _subType: string|null;

    /**
     * Gets the sub type of the service. May be omitted if the type is already unique.
     */
    public get subType(): string|null {
        return this._subType;
    }
}
