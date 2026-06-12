import type { Harmonix } from "../client/Bot";

export interface HarmonixCustomEvents {}

export type HarmonixEventMap = {
    [event: PropertyKey]: readonly unknown[];
};

type EventTupleMap<Events> = {
    [Event in keyof Events]: readonly unknown[];
};

export type HarmonixEventListener<
    Events extends EventTupleMap<Events>,
    Event extends keyof Events
> = (bot: Harmonix, ...args: Events[Event]) => unknown | Promise<unknown>;

interface ListenerEntry {
    listener: (...args: any[]) => unknown | Promise<unknown>;
    once: boolean;
}

/**
 * A typed application event bus. The bot is injected as the first listener
 * argument and is intentionally omitted from emit calls.
 */
export class HarmonixEventEmitter<
    Events extends EventTupleMap<Events> = HarmonixCustomEvents
> {
    private readonly listeners = new Map<keyof Events, Set<ListenerEntry>>();

    constructor(private readonly bot: Harmonix) {}

    on<Event extends keyof Events>(
        event: Event,
        listener: HarmonixEventListener<Events, Event>
    ): this {
        return this.addListener(event, listener, false);
    }

    once<Event extends keyof Events>(
        event: Event,
        listener: HarmonixEventListener<Events, Event>
    ): this {
        return this.addListener(event, listener, true);
    }

    off<Event extends keyof Events>(
        event: Event,
        listener: HarmonixEventListener<Events, Event>
    ): this {
        const entries = this.listeners.get(event);
        if (!entries) return this;

        for (const entry of entries) {
            if (entry.listener === listener) entries.delete(entry);
        }

        if (entries.size === 0) this.listeners.delete(event);
        return this;
    }

    emit<Event extends keyof Events>(event: Event, ...args: Events[Event]): boolean {
        const entries = this.consumeListeners(event);
        for (const entry of entries) {
            void entry.listener(this.bot, ...args);
        }
        return entries.length > 0;
    }

    async emitAsync<Event extends keyof Events>(
        event: Event,
        ...args: Events[Event]
    ): Promise<boolean> {
        const entries = this.consumeListeners(event);
        await Promise.all(entries.map(entry => entry.listener(this.bot, ...args)));
        return entries.length > 0;
    }

    removeAllListeners(event?: keyof Events): this {
        if (event === undefined) this.listeners.clear();
        else this.listeners.delete(event);
        return this;
    }

    listenerCount(event: keyof Events): number {
        return this.listeners.get(event)?.size ?? 0;
    }

    eventNames(): Array<keyof Events> {
        return Array.from(this.listeners.keys());
    }

    private addListener<Event extends keyof Events>(
        event: Event,
        listener: HarmonixEventListener<Events, Event>,
        once: boolean
    ): this {
        const entries = this.listeners.get(event) ?? new Set<ListenerEntry>();
        entries.add({ listener, once });
        this.listeners.set(event, entries);
        return this;
    }

    private consumeListeners(event: keyof Events): ListenerEntry[] {
        const entries = this.listeners.get(event);
        if (!entries) return [];

        const snapshot = Array.from(entries);
        for (const entry of snapshot) {
            if (entry.once) entries.delete(entry);
        }
        if (entries.size === 0) this.listeners.delete(event);
        return snapshot;
    }
}
