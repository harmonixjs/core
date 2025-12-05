import 'reflect-metadata';
import { PermissionResolvable } from 'discord.js';
import { ComponentType } from '../types/ComponentTypes';

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

export function Component<T extends ComponentType = ComponentType>(options: ComponentOptions<T>): ClassDecorator {
    return function <TFunction extends Function>(target: TFunction) {
        const prototype = target.prototype;

        if (typeof prototype.execute !== 'function') {
            throw new TypeError(
                `@Component decorator requires an 'execute' method in class ${target.name}\n\n` +
                'Example:\n' +
                '@Component({ id: "test" })\n' +
                'export default class TestButton implement ComponentExecutor<InteractionButton> {\n' +
                '  async execute(bot: Bot, ctx: ComponentContext<InteractionButton>) {\n' +
                '    // Your code\n' +
                '  }\n' +
                '}'
            );
        }

        const componentOptions = {
            type: 'button' as T,
            ...options
        };

        Reflect.defineMetadata('component:options', componentOptions, target);

        return target;
    }
}