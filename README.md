# homebridge-framework

This framework provides an easy-to-use wrapper for the homebridge API. It aims to only provide the features that are actually needed to develop a plugin.
The framework is written in TypeScript and it is recommended to also develop the plugins with this framework in TypeScript.
Besides the stripped-down API that this framework provides, it automatically manages accessories, services and characteristics. There is no need to explicitely remove those entities from homebridge. If an accessory/service/characteristic is not "used" at runtime, it is removed from homebridge.

## Features

* Declarative syntax
* Automatic registration/deregistration of accessories
* Automatic adding/removing of services
* Automatic adding/removing of characteristics
* Typed configuration

## Getting Started

Create a new project and add the framework (`homebridge-framework`) as a `devDependency` to the NPM `package.json` file.

## Configuration

Create a new interface for your configuration. This will be used to access the configuration strongly typed.

```ts

export interface MyConfigurationInterface {
    myString: string;
}

```

## Platform

In order to use the framework, create a new class that inherits from `HomebridgePlatform`:

```ts
import { HomebridgePlatform, Homebridge } from 'homebridge-framework';
import { MyConfigurationInterface } from './my-configuration-interface';

export class MyPlatform extends HomebridgePlatform<MyConfigurationInterface> {

    // Overwrite the pluginName property to set the name of your plugin
    public get pluginName(): string {
        return 'my-plugin-name';
    }    
    
    // Overwrite the platformName property to set the name of your platform (used in the config.json file)
    public get platformName(): string {
        return 'FrameworkSamplePlatform';
    }

    // Overwrite the initialize method. You can either return void, or Promise<void> if you have asyncronous calls here.
    // "Declare" all your accessories, services and characteristics in this method. 
    // After the execution of this method, the framework will automatically remove all accessories/services/characteristics that
    // have been cached by homebridge but not "declared" while initialization.
    public initialize() {

        // === declaration of accessories/services/characteristics ===

        // "Declare" an accessory that should be exposed
        // The accessory ID (second parameter) is used to match the accessory from the cached accessories
        const myAccessory = this.useAccessory('My Accessory Name', 'my-accessory-id');

        // "Declare" a service for your accessory, e.g. a switch
        // The Homebridge class provides access to a static "list" of services
        const mySwitch = myAccessory.useService(Homebridge.Services.Switch, 'My Switch Name');

        // "Declare" a characteristic for your service, e.g. the on characteristic
        // The generic type parameter should match the type of the characteristic
        const onCharacteristic = mySwitch.useCharacteristic<boolean>(Homebridge.Characteristics.On);

        // === other features ===

        // This is how you can easily set accessory information
        const myAccessoryInformation = new AccessoryInformation();
        myAccessoryInformation.manufacturer = 'Me';
        myAccessoryInformation.model = 'My Accessory';
        myAccessoryInformation.serialNumber = '123';
        myAccessoryInformation.firmwareRevision = '1.1';
        myAccessoryInformation.hardwareRevision = '1.0';
        myAccessory.setInformation(myAccessoryInformation);

        // This is how you set the properties of a characteristic (e.g. need for thermostats to set minimum and maximum temperature)
        onCharacteristic.setProperties({
            ...
        });

        // This is how you access the value of a characteristic
        const onCharacteristicValue = onCharacteristic.value;
        console.log(onCharacteristicValue);

        // This is how you update the value of a characteristic
        onCharacteristic.value = true;

        // This is how you handle changes of the value made by the HomeKit user
        onCharacteristic.valueChanged = newValue => {
            console.log(newValue);
        };

        // This is how to access the configuration
        console.log(this.configuration.myString);

        // === homebridge logging ===

        this.logger('default');
        this.logger.debug('debug');
    }

}

```

## Index file

In order to load the correct platform instance, your main plugin file should look like this:

```ts
import { Homebridge } from 'homebridge-framework';
import { MyPlatform } from './my-platform';

module.exports = Homebridge.register(new MyPlatform());

```
