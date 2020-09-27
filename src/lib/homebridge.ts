
import { HomebridgePlatform } from './homebridge-platform';
import { HomebridgePlatformRegistration } from './homebridge-platform-registration';
import { PlatformAccessory, Logger, API } from 'homebridge';
import { Service as HapService, Characteristic as HapCharacteristic, Categories as HapCategory } from 'hap-nodejs';

/**
 * Represents the helper for registering the platform.
 */
export class Homebridge {
    
    /**
     * Creates a registration function for the platform and returns it.
     * @param platform The platform that should be registered.
     * @returns Returns the registration function that can be exported in the main file.
     */
    public static register<TConfiguration>(platform: HomebridgePlatform<TConfiguration>): (api: API) => void {
        
        // Initializes the registration object, which is used to hand over the constructor objects to the platform
        const registration = new HomebridgePlatformRegistration<TConfiguration>();

        // Defines a proxy object which is created by homebridge
        function Proxy(proxyLogger: Logger, proxyConfiguration: TConfiguration, proxyApi: API) {
            registration.api = proxyApi;
            registration.logger = proxyLogger;
            registration.configuration = proxyConfiguration;

            // Registers a global variable that contains the HAP API, so that in can be easily referenced in the code without having to navigate via the homebridge API
            (<any>global).homebridgeFrameworkHap = proxyApi.hap;

            // Calls the register function so that the objects are registered at the platform
            platform.register(registration);
        }

        // Defines the required configureAccessory function that is called by homebridge
        Proxy.prototype.configureAccessory = (accessory: PlatformAccessory) => {
            registration.cachedPlatformAccessories.push(accessory);
        }
        
        // Returns the registration function
        return (api: API) => {
            const platformPluginConstructor: any = Proxy; 
            api.registerPlatform(platform.pluginName, platform.platformName, platformPluginConstructor);
        };
    }

    /**
     * Gets the HAP service types.
     */
    public static get Services(): typeof HapService {

        // Checks if the global variable has already been set
        const hap = (<any>global).homebridgeFrameworkHap;
        if (hap === undefined) {
            throw new Error("The platform has not been registered yet.");
        }

        // Returns the service type (that contains the actual derived service types)
        return hap.Service;
    }

    /**
     * Gets the HAP characteristic types.
     */
    public static get Characteristics(): typeof HapCharacteristic {

        // Checks if the global variable has already been set
        const hap = (<any>global).homebridgeFrameworkHap;
        if (hap === undefined) {
            throw new Error("The platform has not been registered yet.");
        }

        // Returns the characteristic type (that contains the actual derived characteristic types)
        return hap.Characteristic;
    }

    /**
     * Gets the HAP categories.
     */
    public static get Categories(): typeof HapCategory {

        // Checks if the global variable has already been set
        const hap = (<any>global).homebridgeFrameworkHap;
        if (hap === undefined) {
            throw new Error("The platform has not been registered yet.");
        }

        // Returns the characteristic type (that contains the actual derived characteristic types)
        return hap.Categories;
    }
}
