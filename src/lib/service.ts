
import { Service as HapService, WithUUID, Characteristic as HapCharacteristic, CharacteristicValue } from 'hap-nodejs';
import { Accessory } from './accessory';
import { Characteristic } from './characteristic';

/**
 * Represents a wrapper around HAP services with with support for auto-removal of unused characteristics.
 */
export class Service {

    /**
     * Initializes a new Service instance.
     * @param accessory The parent accessory.
     * @param type The type of the service.
     * @param name The name that should be displayed in HomeKit.
     * @param subType The sub type of the service. May be omitted if the type is already unique.
     */
    constructor(accessory: Accessory, type: typeof HapService, name: string, subType?: string) {
        this._accessory = accessory;
        this._type = type;
        this._name = name;
        this._subType = subType || null;

        // Checks if the service has been cached
        let hapService: HapService|null = null;
        if (this.subType != null) {
            hapService = this.accessory.platformAccessory.getServiceByUUIDAndSubType(this.type, this.subType) || null;
        } else {
            hapService = this.accessory.platformAccessory.getService(<WithUUID<typeof HapService>>this.type) || null;
        }
        if (hapService) {
            this._hapService = hapService;
            return;
        }

        // Creates the new service
        this._hapService = this.accessory.platformAccessory.addService(this.type, this.name, this.subType);
    }

    /**
     * Contains the parent accessory.
     */
    private _accessory: Accessory;

    /**
     * Gets the parent accessory.
     * @internal
     */
    public get accessory(): Accessory {
        return this._accessory;
    }

    /**
     * Contains the HAP service.
     */
    private _hapService: HapService;

    /**
     * Gets the HAP service.
     * @internal
     */
    public get hapService(): HapService {
        return this._hapService;
    }

    /**
     * Contains the type of the service.
     */
    private _type: typeof HapService;

    /**
     * Gets the type of the service.
     */
    public get type(): typeof HapService {
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

    /**
     * Contains the characteristics.
     */
    private _characteristics: Array<Characteristic<CharacteristicValue>> = new Array<Characteristic<CharacteristicValue>>();

    /**
     * Gets the characteristics.
     */
    public get characteristics(): Array<Characteristic<CharacteristicValue>> {
        return this._characteristics;
    }

    /**
     * Defines a characteristic for usage with the service. When defining a characteristic, it is marked as used and thus not removed from HomeKit after the initialization.
     * @param type The type of the characteristic.
     * @param value The initial value. If omitted, the cached value is used.
     */
    public useCharacteristic<TValue extends CharacteristicValue>(type: typeof HapCharacteristic, value?: TValue): Characteristic<TValue> {

        // Checks if the characteristic has already been defined for usage
        const characteristic = this.characteristics.find(s => s.type === type);
        if (characteristic) {
            return <Characteristic<TValue>><any>characteristic;
        }

        // Creates a new characteristic and returns it
        const newCharacteristic = new Characteristic<TValue>(this, type, value);
        this.characteristics.push(<Characteristic<CharacteristicValue>><any>newCharacteristic);
        return newCharacteristic;
    }

    /**
     * Removes all cached characteristics that have not been defined for usage.
     */
    public removeUnusedCharacteristics() {
        for (let characteristic of this.hapService.characteristics) {

            // The name characteristic is always used by homebridge
            if (characteristic.UUID === this.accessory.platform.api.hap.Characteristic.Name.UUID) {
                continue;
            }

            // Removes the unused services
            if (!this.characteristics.some(d => characteristic.UUID === d.hapCharacteristic.UUID)) {
                this.hapService.removeCharacteristic(characteristic);
            }
        }
    }
}
