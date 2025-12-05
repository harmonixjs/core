import 'reflect-metadata';
import { 
    APIApplicationCommandOptionChoice, 
    ApplicationCommandOptionType, 
    PermissionResolvable 
} from 'discord.js';
import { CommandType } from '../types/CommandTypes';

export interface CommandOptions<T extends CommandType = 'slash'> {
    /**
     * Name of the command (unique identifier)
     */
    name: string;
    /**
     * Description of the command
     */
    description: string;
    /**
     * Type of the command (slash, prefix, both)
     * Default: 'slash'
     */
    type?: T;
    /**
     * Cooldown time in microseconds for the command for each user
     */
    user_cooldown?: number;
    /**
     * Cooldown time in microseconds for the command for each guild
     */
    guild_cooldown?: number;
    /**
     * Permissions requested from the Discord user
     */
    member_permission?: bigint|PermissionResolvable;
    /**
     * Options for the command (slash commands only)
     */
    options?: Options[];

}

export interface Options {
    /**
     * Nom de l'option (ce champ doit être unique)
     */
    name: string;
    /**
     * Desciption de l'option
     */
    description: string;
    /**
     * Type de l'option
     */
    type: number|ApplicationCommandOptionType;
    /**
     * L'option est requise
     */
    required?: boolean;
    /**
     * L'option est une autocompletion (utilisation uniquement si requis call API, sinon utiliser choices)
     */
    autocomplete?: boolean;
    /**
     * Si l'options actuelle est une subcommand alors on peut mettre à nouveau des options
     */
    options?: Options[];
    /**
     * Ajout de choix directement dans l'option
     */
    choices?: APIApplicationCommandOptionChoice<string | number>[];
}

const COMMAND_METADATA = Symbol('command:metadata');

// Define the _Command decorator
export function Command<T extends CommandType = CommandType>(options: CommandOptions<T>): ClassDecorator {
    return function <TFunction extends Function>(target: TFunction) {
        const prototype = target.prototype;

        if (typeof prototype.execute !== 'function') {
            throw new TypeError(
                `@Command decorator requires an 'execute' method in class ${target.name}\n\n` +
                'Example:\n' +
                '@Command({ name: "test", description: "Test command" })\n' +
                'export default class TestCommand implement CommandExecutor {\n' +
                '  async execute(bot: Bot, ctx: CommandContext) {\n' +
                '    // Your code\n' +
                '  }\n' +
                '}'
            );
        }

        const commandOptions = {
            type: 'slash' as T,
            ...options
        };

        Reflect.defineMetadata(COMMAND_METADATA, commandOptions, target);
        
        return target;
    };
}

export function getCommandMetadata(target: any): CommandOptions | undefined {
  return Reflect.getMetadata(COMMAND_METADATA, target);
}