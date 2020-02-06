
/**
 * Represents the interface for the homebridge logger.
 */
export declare interface Logger {

    /**
     * Logs a message in info level.
     * @param message The message to be logged.
     */
    (message: string): void;

    /**
     * Logs a message in debug level.
     * @param message The message to be logged.
     */
    debug(message: string): void;

    /**
     * Logs a message in info level.
     * @param message The message to be logged.
     */
    info(message: string): void;

    /**
     * Logs a message in warning level.
     * @param message The message to be logged.
     */
    warn(message: string): void;

    /**
     * Logs a message in error level.
     * @param message The message to be logged.
     */
    error(message: string): void;
}
