
import { Accessory } from 'hap-nodejs';
import { HomebridgePlatform } from './homebridge-platform';
import { HomebridgePlatformRegistration } from './homebridge-platform-registration';

/**
 * Represents the helper for registering the platform.
 */
export class Homebridge {
    
    /**
     * Creates a registration function for the platform and returns it.
     * @param platform The platform that should be registered.
     * @returns Returns the registration function that can be exported in the main file.
     */
    public static register<TConfiguration>(platform: HomebridgePlatform<TConfiguration>): (api: HomebridgeApi) => void {
        
        // Initializes the registration object, which is used to hand over the constructor objects to the platform
        const registration = new HomebridgePlatformRegistration<TConfiguration>();

        // Defines a proxy object which is created by homebridge
        function Proxy(proxyApi: HomebridgeApi, proxyLogger: Logger, proxyConfiguration: TConfiguration) {
            registration.api = proxyApi;
            registration.logger = proxyLogger;
            registration.configuration = proxyConfiguration;

            // Calls the register function so that the objects are registered at the platform
            platform.register(registration);
        }

        // Defines the required configureAccessory function that is called by homebridge
        Proxy.prototype.configureAccessory = (accessory: Accessory) => {
            registration.cachedAccessories.push(accessory);
        }
        
        // Returns the registration function
        return (api: HomebridgeApi) => {
            api.registerPlatform(platform.pluginName, platform.platformName, Proxy, true);
        };
    }
}