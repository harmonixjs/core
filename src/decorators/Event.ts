import 'reflect-metadata';
import type { ClientEvents } from "discord.js";
import type { HarmonixCustomEvents } from "../events/HarmonixEventEmitter";
import type {
    CustomEventExecutor,
    CustomEventHandler,
    EventExecutor,
    EventHandler
} from "../executors/EventExecutor";

type EventClass<Event extends keyof ClientEvents> =
    abstract new (...args: any[]) => EventExecutor<Event>;

export interface EventDecorator<Event extends keyof ClientEvents> {
    <Class extends EventClass<Event>>(target: Class): Class;
    handler<Handler extends EventHandler<Event>>(handler: Handler): Handler;
}

export function Event<Event extends keyof ClientEvents>(
    event: Event
): EventDecorator<Event> {
    const decorator = function <Class extends EventClass<Event>>(target: Class): Class {
        Reflect.defineMetadata('event:event', event, target);
        Reflect.defineMetadata('event:source', 'discord', target);

        return target;
    } as EventDecorator<Event>;

    decorator.handler = handler => handler;
    return decorator;
}

type CustomEventClass<Event extends keyof HarmonixCustomEvents> =
    abstract new (...args: any[]) => CustomEventExecutor<Event>;

export interface CustomEventDecorator<Event extends keyof HarmonixCustomEvents> {
    <Class extends CustomEventClass<Event>>(target: Class): Class;
    handler<Handler extends CustomEventHandler<Event>>(handler: Handler): Handler;
}

export function CustomEvent<Event extends keyof HarmonixCustomEvents>(
    event: Event
): CustomEventDecorator<Event> {
    const decorator = function <Class extends CustomEventClass<Event>>(
        target: Class
    ): Class {
        Reflect.defineMetadata("event:event", event, target);
        Reflect.defineMetadata("event:source", "custom", target);
        return target;
    } as CustomEventDecorator<Event>;

    decorator.handler = handler => handler;
    return decorator;
}
