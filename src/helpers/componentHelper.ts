import { Harmonix } from "../client/Bot";
import { ComponentContext } from "../contexts/ComponentContext";
import { Component, ComponentOptions } from "../decorators/Component";
import { ComponentExecutor } from "../executors/ComponentExecutor";
import { ComponentType, InferComponentInteraction } from "../types/ComponentTypes";


export function createComponentContext<T extends ComponentType>(
  bot: Harmonix,
  interaction: InferComponentInteraction<T>,
  type: T
): ComponentContext<T> {
  const guild = interaction.guild;
  return new ComponentContext(bot, interaction, type, guild);
}

export function createComponent<T extends ComponentType = 'button'>(
    options: ComponentOptions<T>,
    executor: (bot: Harmonix, ctx: ComponentContext<T>) => Promise<any> | any
) {
    @Component(options)
    class GeneratedComponent implements ComponentExecutor<T> {
        execute = executor;
    }

    return GeneratedComponent;
}