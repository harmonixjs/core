import { ClientEvents } from "discord.js";
import { Harmonix } from "../client/Bot";
import { Event } from "../decorators/Event";
import { EventExecutor } from "../executors/EventExecutor";

export function createEvent<E extends keyof ClientEvents>(
    options: E,
    executor: (bot: Harmonix, ...args: ClientEvents[E]) => Promise<any> | any
) {
    @Event(options)
    class GeneratedEvent implements EventExecutor<E> {
        execute = executor;
    }

    return GeneratedEvent;
}