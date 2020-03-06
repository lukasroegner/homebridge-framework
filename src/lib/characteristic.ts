
import { WithUUID, Characteristic as HapCharacteristic, CharacteristicValue, CharacteristicProps } from 'hap-nodejs';
import { Service } from './service';

/**
 * Represents a wrapper around HAP characteristics with with support for easy configuration and update.
 */
export class Characteristic<TValue extends CharacteristicValue> {

    /**
     * Initializes a new Characteristic instance.
     * @param service The parent service.
     * @param type The type of the characteristic.
     * @param value The initial value. If omitted, the cached value is used.
     */
    constructor(service: Service, type: typeof HapCharacteristic, value?: TValue) {
        this.service = service;
        this._type = type;

        // Checks if the characteristic has been cached
        let hapCharacteristic: HapCharacteristic|null = this.service.hapService.getCharacteristic(<WithUUID<typeof HapCharacteristic>>this.type) || null;
        if (hapCharacteristic) {
            this._hapCharacteristic = hapCharacteristic;
        } else {

            // Creates the new characteristic
            this._hapCharacteristic = this.service.hapService.addCharacteristic(this.type);
        }

        // Sets the value of the characteristic
        if (value !== undefined) {
            this.hapCharacteristic.updateValue(value);
        }

        // Subscribes for changes of the value
        this.hapCharacteristic.on(<any>'set', async (value: any, callback: any) => {

            // Checks if a handler has been set
            if (this.valueChanged == null) {
                return callback();
            }
            
            // Calls the handler function
            const result = this.valueChanged(value);
            if (result instanceof Promise) {
                await result;
            }

            // Calls the callback
            callback();
        });
    }

    /**
     * Contains the parent service.
     */
    private service: Service;

    /**
     * Contains the characteristic.
     */
    private _hapCharacteristic: HapCharacteristic;

    /**
     * Gets the characteristic.
     * @internal
     */
    public get hapCharacteristic(): HapCharacteristic {
        return this._hapCharacteristic;
    }

    /**
     * Contains the type of the characteristic.
     */
    private _type: typeof HapCharacteristic;

    /**
     * Gets the type of the characteristic.
     */
    public get type(): typeof HapCharacteristic {
        return this._type;
    }

    /**
     * Updates the properties of the characteristic.
     * @param properties The new properties of the characteristic.
     */
    public setProperties(properties: CharacteristicProps) {
        this.hapCharacteristic.setProps(properties);
    }

    /**
     * Gets the value of the characteristic.
     */
    public get value(): TValue|null {
        return <TValue|null>this.hapCharacteristic.value;
    }

    /**
     * Sets the value of the characteristic.
     */
    public set value(value: TValue|null) {
        this.hapCharacteristic.updateValue(value);
    }

    /**
     * Contains a handler that is executed when the value of the characteristic has been changed by the user.
     */
    private _valueChanged: ((newValue: TValue) => Promise<void>|void)|null = null;

    /**
     * Gets a handler that is executed when the value of the characteristic has been changed by the user.
     */
    public get valueChanged(): ((newValue: TValue) => Promise<void>|void)|null {
        return this._valueChanged;
    }

    /**
     * Sets a handler that is executed when the value of the characteristic has been changed by the user.
     */
    public set valueChanged(value: ((newValue: TValue) => Promise<void>|void)|null) {
        this._valueChanged = value;
    }
}
