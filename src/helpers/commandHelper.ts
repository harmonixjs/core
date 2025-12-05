import { Harmonix } from "../client/Bot";
import { CommandContext, PrefixCommandOptions } from "../contexts/CommandContext";
import { Command, CommandOptions } from "../decorators/Command";
import { CommandExecutor } from "../executors/CommandExecutor";
import { CommandType, InferInteractionType } from "../types/CommandTypes";

export function createCommand<T extends CommandType = 'slash'>(
    options: CommandOptions<T>,
    executor: (bot: Harmonix, ctx: CommandContext<T>) => Promise<any> | any
) {
    @Command(options)
    class GeneratedCommand implements CommandExecutor<T> {
        execute = executor;
    }

    return GeneratedCommand;
}

export function createCommandContext<T extends CommandType>(
  bot: Harmonix,
  interaction: InferInteractionType<T>,
  type: T,
  prefixOptions?: PrefixCommandOptions
): CommandContext<T> {
  const guild = interaction.guild;
  return new CommandContext(bot, interaction, type, guild, prefixOptions);
}