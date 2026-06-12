import 'reflect-metadata';
import {
    ApplicationCommandOptionData,
    ApplicationCommandType,
    ApplicationIntegrationType,
    InteractionContextType,
    LocalizationMap,
    PermissionResolvable
} from 'discord.js';
import { CommandType } from '../types/CommandTypes';
import type {
    CommandExecutor,
    CommandHandler
} from '../executors/CommandExecutor';

export interface CommandChoiceLocalizationKeys {
    [choiceValue: string]: string;
}

export interface CommandOptionLocalizationKeys {
    name?: string;
    description?: string;
    choices?: CommandChoiceLocalizationKeys;
    options?: Record<string, CommandOptionLocalizationKeys>;
}

export interface CommandLocalizationKeys {
    name?: string;
    description?: string;
    options?: Record<string, CommandOptionLocalizationKeys>;
}

export interface CommandOptions<T extends CommandType = 'slash'> {
    name: string;
    description?: string;
    type?: T;
    applicationType?:
        | ApplicationCommandType.ChatInput
        | ApplicationCommandType.User
        | ApplicationCommandType.Message;
    user_cooldown?: number;
    guild_cooldown?: number;
    member_permission?: bigint | PermissionResolvable;
    options?: readonly ApplicationCommandOptionData[];
    nameLocalizations?: LocalizationMap;
    descriptionLocalizations?: LocalizationMap;
    contexts?: readonly InteractionContextType[];
    integrationTypes?: readonly ApplicationIntegrationType[];
    nsfw?: boolean;
    /**
     * Translation keys consumed by plugins such as @harmonixjs/i18n.
     */
    localization?: CommandLocalizationKeys;
}

/** @deprecated Use ApplicationCommandOptionData from discord.js. */
export type Options = ApplicationCommandOptionData;

const COMMAND_METADATA = Symbol('command:metadata');

type CommandClass<T extends CommandType> =
    abstract new (...args: any[]) => CommandExecutor<T>;

export interface CommandDecorator<T extends CommandType> {
    <Class extends CommandClass<T>>(target: Class): Class;
    handler<Handler extends CommandHandler<T>>(handler: Handler): Handler;
}

export function Command<T extends CommandType = 'slash'>(
    options: CommandOptions<T>
): CommandDecorator<T> {
    const decorator = function <Class extends CommandClass<T>>(target: Class): Class {
        Reflect.defineMetadata(COMMAND_METADATA, {
            type: 'slash' as T,
            ...options
        }, target);

        return target;
    } as CommandDecorator<T>;

    decorator.handler = handler => handler;
    return decorator;
}

export function getCommandMetadata(target: any): CommandOptions | undefined {
    return Reflect.getMetadata(COMMAND_METADATA, target);
}
