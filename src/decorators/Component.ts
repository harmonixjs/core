import 'reflect-metadata';
import { PermissionResolvable } from 'discord.js';
import { ComponentType } from '../types/ComponentTypes';
import type {
    ComponentExecutor,
    ComponentHandler
} from '../executors/ComponentExecutor';

export interface ComponentOptions<T extends ComponentType = 'button'> {
    /**
     * Component ID (unique identifier)
     */
    id: string;
    /**
     * Type of the component
     * @default 'button'
     */
    type?: T;
    /**
     * Permissions requested from the Discord user
     */
    member_permission?: bigint | PermissionResolvable;
}

type ComponentClass<T extends ComponentType> =
    abstract new (...args: any[]) => ComponentExecutor<T>;

export interface ComponentDecorator<T extends ComponentType> {
    <Class extends ComponentClass<T>>(target: Class): Class;
    handler<Handler extends ComponentHandler<T>>(handler: Handler): Handler;
}

export function Component<T extends ComponentType = 'button'>(
    options: ComponentOptions<T>
): ComponentDecorator<T> {
    const decorator = function <Class extends ComponentClass<T>>(target: Class): Class {
        const componentOptions = {
            type: 'button' as T,
            ...options
        };

        Reflect.defineMetadata('component:options', componentOptions, target);

        return target;
    } as ComponentDecorator<T>;

    decorator.handler = handler => handler;
    return decorator;
}
