import {
  ButtonInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction,
  RoleSelectMenuInteraction,
  ChannelSelectMenuInteraction,
  MentionableSelectMenuInteraction,
  ModalSubmitInteraction
} from 'discord.js';

/**
 * Component types available
 */
export type ComponentType =
  | 'button'
  | 'string-select'
  | 'user-select'
  | 'role-select'
  | 'channel-select'
  | 'mentionable-select'
  | 'modal';

/**
 * Map of component types to their interaction types
 */
export type ComponentInteractionMap = {
  button: ButtonInteraction;
  'string-select': StringSelectMenuInteraction;
  'user-select': UserSelectMenuInteraction;
  'role-select': RoleSelectMenuInteraction;
  'channel-select': ChannelSelectMenuInteraction;
  'mentionable-select': MentionableSelectMenuInteraction;
  modal: ModalSubmitInteraction;
};

/**
 * Get the interaction type based on the ComponentType
 */
export type InferComponentInteraction<T extends ComponentType> = ComponentInteractionMap[T];

/**
 * Union of all possible component interaction types
 */
export type AnyComponentInteraction = ComponentInteractionMap[ComponentType];

/**
 * Get the ComponentType based on the interaction type
 */
export type ComponentTypeFromValue<T> = {
  [K in keyof ComponentInteractionMap]: ComponentInteractionMap[K] extends T ? K : never
}[keyof ComponentInteractionMap];

/**
 * Get the ComponentType from an interaction instance type
 */
export type InferComponentType<I> =
    I extends ButtonInteraction ? 'button' :
    I extends StringSelectMenuInteraction ? 'string-select' :
    I extends UserSelectMenuInteraction ? 'user-select' :
    I extends RoleSelectMenuInteraction ? 'role-select' :
    I extends ChannelSelectMenuInteraction ? 'channel-select' :
    I extends MentionableSelectMenuInteraction ? 'mentionable-select' :
    I extends ModalSubmitInteraction ? 'modal' :
    never;

/**
 * Get the ComponentType from an interaction instance
 */
export function getComponentType(i: AnyComponentInteraction): ComponentType {
  if (i.isButton()) return 'button';
  if (i.isStringSelectMenu()) return 'string-select';
  if (i.isUserSelectMenu?.()) return 'user-select';
  if (i.isRoleSelectMenu?.()) return 'role-select';
  if (i.isChannelSelectMenu?.()) return 'channel-select';
  if (i.isMentionableSelectMenu?.()) return 'mentionable-select';
  if (i.isModalSubmit()) return 'modal';
  throw new Error("Unknown interaction type");
}
  