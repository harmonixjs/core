import { Events, Message, OmitPartialGroupDMChannel } from "discord.js";
import { Event } from "../decorators/Event";
import { EventExecutor } from "../executors/EventExecutor";
import { Harmonix } from "../client/Bot";
import { CommandExecutor } from "../executors/CommandExecutor";
import { CommandContext } from "../contexts/CommandContext";
import { createCommandContext } from "../helpers/commandHelper";

@Event(Events.MessageCreate)
export default class MessageCreate implements EventExecutor<Events.MessageCreate> {
    execute(bot: Harmonix, message: OmitPartialGroupDMChannel<Message<boolean>>) {
        if(message.author.bot) return;

        const prefix = bot.config.bot.prefix;
        if(!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();
        if(!commandName) return;

        const command = bot.commands.get('prefix')?.get(commandName);
        if(!command) return;

        const commandInstance: CommandExecutor = new command();
        commandInstance.execute(bot, createCommandContext<'prefix'>(bot, message, 'prefix', { commandName, prefix }));
    }
}