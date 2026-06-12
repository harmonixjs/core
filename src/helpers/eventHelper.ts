import { ClientEvents } from "discord.js";
import { Harmonix } from "../client/Bot";
import { CustomEvent, Event } from "../decorators/Event";
import {
    HarmonixCustomEvents,
    HarmonixEventListener
} from "../events/HarmonixEventEmitter";
import { EventExecutor } from "../executors/EventExecutor";

export function defineEvent<E extends keyof ClientEvents>(
    options: E,
    executor: (bot: Harmonix, ...args: ClientEvents[E]) => Promise<any> | any
) {
    @Event(options)
    class GeneratedEvent implements EventExecutor<E> {
        execute = executor;
    }

    return GeneratedEvent;
}

export const createEvent = defineEvent;

export function defineCustomEvent<Event extends keyof HarmonixCustomEvents>(
    event: Event,
    executor: HarmonixEventListener<HarmonixCustomEvents, Event>
) {
    @CustomEvent(event)
    class GeneratedCustomEvent {
        execute = executor;
    }

    return GeneratedCustomEvent;
}
