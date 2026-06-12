import {
    Client,
    Collection,
    ClientOptions,
    Snowflake
} from "discord.js"
import { ensureTypeScriptProject, validateTypeScriptConfig } from "../utils/typescript-check";
import RegisterEvents from "../handlers/EventHandler";
import RegisterCommands from "../handlers/CommandHandler";
import RegisterComponent from "../handlers/ComponentHandler";
import { Logger } from "./Logger";
import type { ApplicationCommandData } from "discord.js";
import type { CommandOptions } from "../decorators/Command";
import type { CommandType } from "../types/CommandTypes";
import {
    HarmonixEventEmitter,
    HarmonixCustomEvents
} from "../events/HarmonixEventEmitter";
import {
    HarmonixProvider,
    HarmonixProviderRegistry,
    HarmonixProviders
} from "../providers/Provider";

export interface BotConfig extends ClientOptions {
    /**
     * Core bot configuration
     */
    bot: {
        /**
         * The bot's client ID (Snowflake)
         */
        id: Snowflake;

        /**
         * The bot's token for login
         */
        token: string;

        /**
         * Optional command prefix for prefix-based commands
         */
        prefix?: string;
    };

    /**
     * Skip TypeScript project and config checks
     */
    skipTypeScriptCheck?: boolean;

    /**
     * Whether the bot is public (global slash commands)
     */
    publicApp?: boolean;

    /**
     * Array of guild IDs to register guild-specific slash commands
     */
    guilds?: Snowflake[];

    /**
     * Optional paths for framework folders
     */
    folders?: {
        /**
         * Path to event handler files
         */
        events?: string;

        /**
         * Path to command handler files
         */
        commands?: string;

        /**
         * Path to component handler files (buttons, selects, etc.)
         */
        components?: string;
    };

    /**
     * Plugins initialized with the bot.
     */
    plugins?: HarmonixPlugin[];

    /**
     * Application services initialized before handlers and login.
     */
    providers?: HarmonixProvider[];
}

/**
 * Plugin packages extend this interface through TypeScript module augmentation.
 *
 * @example
 * declare module "@harmonixjs/core" {
 *   interface HarmonixPluginRegistry {
 *     database: DatabasePlugin;
 *   }
 * }
 */
export interface HarmonixPluginRegistry {}

export type HarmonixPlugins = Readonly<HarmonixPluginRegistry>;

export interface HarmonixPlugin<Name extends string = string> {
    /**
     * Unique name of the plugin.
     * This is used as the key in bot.plugins.
     */
    readonly name: Name;

    /**
     * Initialization method called when the plugin is registered.
     * Receives the Harmonix bot instance.
     * Can perform async operations (e.g., connect to a database)
     */
    init(bot: Harmonix): Promise<void> | void;

    /**
     * Optionally transform an application command before it is sent to Discord.
     */
    transformApplicationCommand?(
        command: ApplicationCommandData,
        metadata: CommandOptions<CommandType>,
        bot: Harmonix
    ): ApplicationCommandData | Promise<ApplicationCommandData>;
}

/**
 * Main bot class for Harmonix framework.
 * Extends Discord.js Client and adds support for:
 * - Commands (prefix, slash, both)
 * - Events with decorators
 * - Components (buttons, selects)
 * - Plugins system
 * 
 * Example usage:
 * ```ts
 * import { Harmonix, BotConfig } from "harmonix";
 * 
 * const botConfig: BotConfig = {
 *   bot: {
 *     id: "YOUR_BOT_CLIENT_ID",
 *     token: "YOUR_BOT_TOKEN"
 *   },
 *   publicApp: true,
 *   folders: {
 *     commands: "./src/commands",
 *     events: "./src/events",
 *     components: "./src/components"
 *   }
 * };
 * 
 * const bot = new Harmonix(botConfig);
 * 
 * // Plugins can be registered in BotConfig.plugins or with bot.use(...).
 * 
 * // Start listening
 * bot.start();
 * ```
 */
export class Harmonix extends Client {

    public readonly config: BotConfig;
    public readonly plugins: HarmonixPlugins;
    public readonly providers: HarmonixProviders;
    public readonly events: HarmonixEventEmitter<HarmonixCustomEvents>;
    public logger: Logger = new Logger();
    private pluginInstances: Map<string, HarmonixPlugin> = new Map();
    private pluginInitializations: Promise<void>[] = [];
    private providerInstances: Map<string, HarmonixProvider> = new Map();
    private providerInitializations: Promise<void>[] = [];
    public commands: Map<CommandType, Collection<string, any>> = new Map([
        ['slash', new Collection()],
        ['prefix', new Collection()],
        ['user', new Collection()],
        ['message', new Collection()],
    ]);
    public components: Collection<String, any> = new Collection();
    public cooldowns: Collection<String, Collection<String, number>> = new Collection();
    private collections: Map<String, Collection<String, any>> = new Map();

    constructor(config: BotConfig) {
        super(config);

        if (!config.skipTypeScriptCheck && process.env.NODE_ENV !== 'test') {
            ensureTypeScriptProject();
            validateTypeScriptConfig();
        }

        this.config = config;
        this.events = new HarmonixEventEmitter(this);
        this.plugins = new Proxy({} as HarmonixPlugins, {
            get: (_target, property) => {
                if (typeof property !== "string") return undefined;
                return this.requirePlugin(property as keyof HarmonixPluginRegistry);
            },
            has: (_target, property) => (
                typeof property === "string" && this.pluginInstances.has(property)
            ),
            ownKeys: () => Array.from(this.pluginInstances.keys()),
            getOwnPropertyDescriptor: (_target, property) => {
                if (typeof property !== "string" || !this.pluginInstances.has(property)) {
                    return undefined;
                }

                return {
                    configurable: true,
                    enumerable: true
                };
            }
        });
        this.providers = new Proxy({} as HarmonixProviders, {
            get: (_target, property) => {
                if (typeof property !== "string") return undefined;
                return this.requireProvider(property as keyof HarmonixProviderRegistry);
            },
            has: (_target, property) => (
                typeof property === "string" && this.providerInstances.has(property)
            ),
            ownKeys: () => Array.from(this.providerInstances.keys()),
            getOwnPropertyDescriptor: (_target, property) => {
                if (typeof property !== "string" || !this.providerInstances.has(property)) {
                    return undefined;
                }

                return {
                    configurable: true,
                    enumerable: true
                };
            }
        });

        config.providers?.forEach(provider => this.provide(provider));
        config.plugins?.forEach(plugin => this.use(plugin));
    }

    /**
     * Start the bot
     */
    async start(): Promise<void> {
        await Promise.all(this.providerInitializations);
        await Promise.all(this.pluginInitializations);
        await this.startHandler();
        await this.login(this.config.bot.token);
    }

    /**
     * Add a collection stored in the bot
     */
    addCollection<T>(name: string, collection: Collection<string, T>) {
        return this.collections.set(name, collection);
    }
    /**
     * Get a collection stored in the bot
     */
    getCollection<T>(name: string): Collection<string, T> | undefined {
        return this.collections.get(name) as Collection<string, T> | undefined;
    }

    /**
     * Create an isolated typed event bus that still injects this bot.
     */
    createEventEmitter<Events extends {
        [Event in keyof Events]: readonly unknown[];
    }>(): HarmonixEventEmitter<Events> {
        return new HarmonixEventEmitter<Events>(this);
    }

    /**
     * Register and initialize an application provider.
     */
    provide(provider: HarmonixProvider): this {
        if (this.providerInstances.has(provider.name)) {
            throw new Error(`Provider with name '${provider.name}' is already registered.`);
        }

        this.providerInstances.set(provider.name, provider);
        try {
            this.providerInitializations.push(Promise.resolve(provider.init(this)));
        } catch (error) {
            this.providerInstances.delete(provider.name);
            throw error;
        }

        return this;
    }

    getProvider<T extends HarmonixProvider>(name: string): T | undefined {
        return this.providerInstances.get(name) as T | undefined;
    }

    requireProvider<Name extends keyof HarmonixProviderRegistry>(
        name: Name
    ): HarmonixProviderRegistry[Name] {
        const provider = this.providerInstances.get(name as string);
        if (!provider) {
            throw new Error(
                `Provider '${String(name)}' is not registered. ` +
                `Add it to BotConfig.providers or call bot.provide(...) first.`
            );
        }

        return provider as HarmonixProviderRegistry[Name];
    }

    /**
     * Register and initialize a plugin.
     */
    use(plugin: HarmonixPlugin): this {
        const pluginName = plugin.name;
        if (this.pluginInstances.has(pluginName)) {
            throw new Error(`Plugin with name '${pluginName}' is already registered.`);
        }

        this.pluginInstances.set(pluginName, plugin);
        (this as any)["_" + pluginName] = plugin;

        try {
            this.pluginInitializations.push(Promise.resolve(plugin.init(this)));
        } catch (error) {
            this.pluginInstances.delete(pluginName);
            delete (this as any)["_" + pluginName];
            throw error;
        }

        console.log(`Plugin with name '${pluginName}' registered.`);
        return this
    }

    /**
     * Get a registered plugin by name (without the "_" prefix)
     */
    getPlugin<T extends HarmonixPlugin>(name: string): T | undefined {
        return this.pluginInstances.get(name) as T | undefined;
    }

    /**
     * Get a registered plugin with its type inferred from the plugin registry.
     * Throws when the plugin has not been registered.
     */
    requirePlugin<Name extends keyof HarmonixPluginRegistry>(
        name: Name
    ): HarmonixPluginRegistry[Name] {
        const plugin = this.pluginInstances.get(name as string);

        if (!plugin) {
            throw new Error(
                `Plugin '${String(name)}' is not registered. ` +
                `Add it to BotConfig.plugins or call bot.use(...) before accessing it.`
            );
        }

        return plugin as HarmonixPluginRegistry[Name];
    }

    async transformApplicationCommand(
        command: ApplicationCommandData,
        metadata: CommandOptions<CommandType>
    ): Promise<ApplicationCommandData> {
        let transformed = command;

        for (const plugin of this.pluginInstances.values()) {
            if (plugin.transformApplicationCommand) {
                transformed = await plugin.transformApplicationCommand(transformed, metadata, this);
            }
        }

        return transformed;
    }

    private async startHandler(): Promise<void> {
        if (this.config.folders?.events) await RegisterEvents(this, this.config.folders.events);
        if (this.config.folders?.commands) await RegisterCommands(this, this.config.folders.commands);
        if (this.config.folders?.components) await RegisterComponent(this, this.config.folders.components);
    }
}
