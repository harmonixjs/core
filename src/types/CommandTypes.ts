import {
    ChatInputCommandInteraction,
    Message,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction
} from "discord.js";

/**
 * Types of commands available
 */
export type CommandType = 'slash' | 'prefix' | 'both' | 'user' | 'message';

/**
 * Map of command types to their interaction types
 */
export type CommandInteractionMap = {
    slash: ChatInputCommandInteraction;
    prefix: Message;
    both: ChatInputCommandInteraction | Message;
    user: UserContextMenuCommandInteraction;
    message: MessageContextMenuCommandInteraction;
}

/**
 * Get the interaction type based on the CommandType
 */
export type InferInteractionType<T extends CommandType = CommandType> = CommandInteractionMap[T];
