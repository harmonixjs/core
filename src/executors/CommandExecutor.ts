import { Harmonix } from "../client/Bot";
import { CommandContext, CommandType } from "../contexts/CommandContext";

/**
 * Interface for command executors in Harmonix.
 * Handles the logic for prefix or slash commands.
 *
 * @typeParam E - The type of command (default: "slash" | "prefix" | "both")
 */
export interface CommandExecutor<E extends CommandType = CommandType> {
    /**
     * Executes the command logic.
     * @param bot - The Harmonix bot instance
     * @param ctx - The command context
     */
    execute(bot: Harmonix, ctx: CommandContext<E>): Promise<any> | any;
}