import fs, { statSync } from "fs";
import { join, resolve } from "path";
import chalk from "chalk";
import 'reflect-metadata';
import { Harmonix } from "../client/Bot";
import { CommandOptions } from "../decorators/Command";
import { CommandExecutor } from "../executors/CommandExecutor";
import { ApplicationCommandType, Collection, PermissionsBitField, REST, Routes } from "discord.js";

export default function RegisterCommands(bot: Harmonix, dir: string) {
    const userDir = resolve(process.cwd(), dir);

    loadCommand(bot, userDir);
    routing(bot);
}

function loadCommand(bot: Harmonix, dir: string) {
    fs.readdirSync(dir).forEach(async (file) => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            loadCommand(bot, filePath);
            return;
        }

        if (!file.endsWith(".js") && !file.endsWith(".ts")) return;
        if(file.endsWith(".d.ts")) return;

        const CommandClass = require(filePath).default;

        const commandOptions: CommandOptions = Reflect.getMetadata(
            "command:options",
            CommandClass
        );

        if (!commandOptions) {
            console.log(chalk.yellow(`File '${file}' does not have a valid @Command decorator.`));
            return;
        }

        if (!commandOptions.name) {
            console.log(chalk.red(`Command in '${file}' is missing a name!`));
            return;
        }

        const instance: CommandExecutor = new CommandClass();

        if (typeof instance.execute !== "function") {
            console.log(chalk.red(`Command '${commandOptions.name}' has no execute() method!`));
            return;
        }

        type CommandTypeKey = 'slash' | 'prefix';
        const types: CommandTypeKey[] = commandOptions.type === 'both' ? ['slash', 'prefix'] : [commandOptions.type || 'slash'];

        types.forEach(type => {
            if (!bot.commands.has(type)) bot.commands.set(type, new Collection());
            bot.commands.get(type)!.set(commandOptions.name, CommandClass);
        });

        console.log(chalk.green(`Command '${commandOptions.name}' registered.`));
    });
}

async function routing(client: Harmonix) {
    const rest = new REST({ version: '10' }).setToken(client.config.bot.token);

    const slashCommands = client.commands.get('slash')?.map((_, name) => {
        const commandOptions: CommandOptions = Reflect.getMetadata("command:options", _);
        return {
            name,
            description: commandOptions.description,
            type: ApplicationCommandType.ChatInput,
            options: commandOptions.options || [],
            default_member_permissions: commandOptions.member_permission ?
                PermissionsBitField.resolve(commandOptions.member_permission).toString()
                : null,
        };
    }) || [];

    try {
        if (client.config.publicApp) {
            // Global commands
            await rest.put(
                Routes.applicationCommands(client.config.bot.id),
                { body: slashCommands }
            );
        } else if (client.config.guilds && client.config.guilds.length > 0) {
            // Per-guild commands
            for (const guildId of client.config.guilds) {
                await rest.put(
                    Routes.applicationGuildCommands(client.config.bot.id, guildId),
                    { body: slashCommands }
                );
            }
        }
    } catch (error) {
        console.error('Error while routing slash commands: ', error);
        // console.dir(slashCommands, { depth: 1, colors: true });
    }
}