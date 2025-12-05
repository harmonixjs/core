import { Harmonix } from "../client/Bot";
import { CommandContext } from "../contexts/CommandContext";
import { CommandType } from "../types/CommandTypes";

/**
 * Interface for command executors in Harmonix.
 * Handles the logic for prefix or slash commands.
 *
 * @typeParam T - The type of command (default: "slash" | "prefix" | "both")
 */
export interface CommandExecutor<T extends CommandType = CommandType> {
    /**
     * Executes the command logic.
     * @param bot - The Harmonix bot instance
     * @param ctx - The command context
     */
    execute(bot: Harmonix, ctx: CommandContext<T>): Promise<any> | any;
}