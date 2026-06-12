import fs, { statSync } from "fs";
import { join, resolve } from "path";
import chalk from "chalk";
import 'reflect-metadata';
import {
    ApplicationCommandData,
    ApplicationCommandType,
    Collection,
    PermissionsBitField,
    REST,
    Routes
} from "discord.js";
import { Harmonix } from "../client/Bot";
import { CommandOptions } from "../decorators/Command";
import { CommandExecutor } from "../executors/CommandExecutor";
import { CommandType } from "../types/CommandTypes";

export default async function RegisterCommands(bot: Harmonix, dir: string): Promise<void> {
    await loadCommands(bot, resolve(process.cwd(), dir));
    await routeCommands(bot);
}

async function loadCommands(bot: Harmonix, dir: string): Promise<void> {
    for (const file of fs.readdirSync(dir)) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            await loadCommands(bot, filePath);
            continue;
        }

        if ((!file.endsWith(".js") && !file.endsWith(".ts")) || file.endsWith(".d.ts")) {
            continue;
        }

        const CommandClass = require(filePath).default;
        const metadata: CommandOptions<CommandType> | undefined = Reflect.getMetadata(
            "command:options",
            CommandClass
        );

        if (!metadata) {
            console.log(chalk.yellow(`File '${file}' does not have a valid @Command decorator.`));
            continue;
        }

        if (!metadata.name) {
            console.log(chalk.red(`Command in '${file}' is missing a name.`));
            continue;
        }

        const instance: CommandExecutor = new CommandClass();
        if (typeof instance.execute !== "function") {
            console.log(chalk.red(`Command '${metadata.name}' has no execute() method.`));
            continue;
        }

        const applicationType = metadata.applicationType ?? ApplicationCommandType.ChatInput;
        const commandTypes: CommandType[] = metadata.type === 'both'
            ? ['slash', 'prefix']
            : applicationType === ApplicationCommandType.User
                ? ['user']
                : applicationType === ApplicationCommandType.Message
                    ? ['message']
                    : [metadata.type ?? 'slash'];

        for (const commandType of commandTypes) {
            if (!bot.commands.has(commandType)) {
                bot.commands.set(commandType, new Collection());
            }
            bot.commands.get(commandType)!.set(metadata.name, CommandClass);
        }

        console.log(chalk.green(`Command '${metadata.name}' registered.`));
    }
}

async function routeCommands(client: Harmonix): Promise<void> {
    const rest = new REST({ version: '10' }).setToken(client.config.bot.token);
    const applicationCommands: ApplicationCommandData[] = [];

    for (const commandType of ['slash', 'user', 'message'] as const) {
        for (const [name, CommandClass] of client.commands.get(commandType) ?? []) {
            const metadata: CommandOptions<CommandType> = Reflect.getMetadata(
                "command:options",
                CommandClass
            );
            const applicationType = metadata.applicationType ??
                (commandType === 'user'
                    ? ApplicationCommandType.User
                    : commandType === 'message'
                        ? ApplicationCommandType.Message
                        : ApplicationCommandType.ChatInput);

            const common = {
                name,
                nameLocalizations: metadata.nameLocalizations,
                defaultMemberPermissions: metadata.member_permission
                    ? PermissionsBitField.resolve(metadata.member_permission)
                    : null,
                contexts: metadata.contexts,
                integrationTypes: metadata.integrationTypes,
                nsfw: metadata.nsfw
            };

            const command: ApplicationCommandData = applicationType === ApplicationCommandType.ChatInput
                ? {
                    ...common,
                    type: ApplicationCommandType.ChatInput,
                    description: metadata.description ?? name,
                    descriptionLocalizations: metadata.descriptionLocalizations,
                    options: metadata.options
                }
                : applicationType === ApplicationCommandType.User
                    ? { ...common, type: ApplicationCommandType.User }
                    : { ...common, type: ApplicationCommandType.Message };

            applicationCommands.push(
                await client.transformApplicationCommand(command, metadata)
            );
        }
    }

    try {
        if (client.config.publicApp) {
            await rest.put(
                Routes.applicationCommands(client.config.bot.id),
                { body: applicationCommands.map(serializeCommand) }
            );
        } else if (client.config.guilds?.length) {
            for (const guildId of client.config.guilds) {
                await rest.put(
                    Routes.applicationGuildCommands(client.config.bot.id, guildId),
                    { body: applicationCommands.map(serializeCommand) }
                );
            }
        }
    } catch (error) {
        console.error('Error while routing application commands:', error);
    }
}

function serializeCommand(command: ApplicationCommandData) {
    return {
        name: command.name,
        name_localizations: command.nameLocalizations,
        description: 'description' in command ? command.description : undefined,
        description_localizations: 'descriptionLocalizations' in command
            ? command.descriptionLocalizations
            : undefined,
        type: command.type,
        options: 'options' in command
            ? command.options?.map(serializeOption)
            : undefined,
        default_member_permissions: command.defaultMemberPermissions === null
            ? null
            : command.defaultMemberPermissions !== undefined
                ? PermissionsBitField.resolve(command.defaultMemberPermissions).toString()
                : undefined,
        contexts: command.contexts,
        integration_types: command.integrationTypes,
        nsfw: command.nsfw
    };
}

function serializeOption(option: any): Record<string, unknown> {
    return {
        type: option.type,
        name: option.name,
        name_localizations: option.nameLocalizations ?? option.name_localizations,
        description: option.description,
        description_localizations:
            option.descriptionLocalizations ?? option.description_localizations,
        required: option.required,
        autocomplete: option.autocomplete,
        choices: option.choices?.map((choice: any) => ({
            name: choice.name,
            name_localizations:
                choice.nameLocalizations ?? choice.name_localizations,
            value: choice.value
        })),
        options: option.options?.map(serializeOption),
        channel_types: option.channelTypes ?? option.channel_types,
        min_value: option.minValue ?? option.min_value,
        max_value: option.maxValue ?? option.max_value,
        min_length: option.minLength ?? option.min_length,
        max_length: option.maxLength ?? option.max_length
    };
}
