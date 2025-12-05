import { Harmonix } from "../client/Bot";
import { CommandContext } from "../contexts/CommandContext";
import { InteractionReplyOptions } from "discord.js";
import { CommandType } from "../types/CommandTypes";

/**
 * Interface for command cooldown handlers in Harmonix.
 * Used to define logic that executes when a command is on cooldown.
 *
 * @typeParam E - The type of command (e.g., "slash", "prefix")
 */
export interface Cooldown<E extends CommandType = 'slash'> {
    /**
     * Called when a command is still on cooldown.
     * @param bot - The Harmonix bot instance
     * @param ctx - The command context
     * @param expiredTimestamp - The timestamp (ms) when the cooldown will expire
     * @returns A Discord.js InteractionReplyOptions object or a Promise resolving to it
     */
    cooldown(bot: Harmonix, ctx: CommandContext<E>, expiredTimestamp: number): Promise<InteractionReplyOptions> | InteractionReplyOptions;
}