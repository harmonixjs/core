import { ChatInputCommandInteraction, Message } from "discord.js";

/**
 * Types of commands available
 */
export type CommandType = 'slash' | 'prefix' | 'both';

/**
 * Map of command types to their interaction types
 */
export type CommandInteractionMap = {
    slash: ChatInputCommandInteraction;
    prefix: Message;
    both: ChatInputCommandInteraction | Message;
}

/**
 * Get the interaction type based on the CommandType
 */
export type InferInteractionType<T extends CommandType = CommandType> = CommandInteractionMap[T];