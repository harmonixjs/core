import { Harmonix } from "../client/Bot";
import { ClientEvents } from "discord.js";
import type { HarmonixCustomEvents } from "../events/HarmonixEventEmitter";

/**
 * Interface for event executors in Harmonix.
 * Used to type event listener classes and ensure correct arguments are passed
 * according to Discord.js's ClientEvents.
 *
 * @typeParam E - The specific Discord.js event key (e.g., "messageCreate", "guildMemberAdd")
 */
export interface EventExecutor<E extends keyof ClientEvents> {
    /**
     * Executes the event logic.
     * @param bot - The Harmonix bot instance
     * @param args - Arguments automatically typed from Discord.js ClientEvents
     */
    execute(bot: Harmonix, ...args: ClientEvents[E]): Promise<any> | any;
}

export interface CustomEventExecutor<E extends keyof HarmonixCustomEvents> {
    execute(
        bot: Harmonix,
        ...args: HarmonixCustomEvents[E]
    ): Promise<any> | any;
}

export type EventHandler<E extends keyof ClientEvents> =
    EventExecutor<E>["execute"];

export type CustomEventHandler<E extends keyof HarmonixCustomEvents> =
    CustomEventExecutor<E>["execute"];
