import {
    Guild,
    GuildMember,
    User,
    InteractionReplyOptions,
    InteractionResponse,
    MessagePayload,
    TextBasedChannel,
    InteractionEditReplyOptions,
    Message,
    RoleSelectMenuInteraction,
    ChannelSelectMenuInteraction
} from 'discord.js';
import { Harmonix } from '../client/Bot';
import { ComponentType, InferComponentInteraction } from '../types/ComponentTypes';
import ExtendsChannel from '../structures/ExtendsChannel';

export class ComponentContext<T extends ComponentType = 'button'> extends ExtendsChannel {
    public readonly bot: Harmonix;
    public readonly interaction: InferComponentInteraction<T>;
    public readonly type: T;

    constructor(
        bot: Harmonix,
        interaction: InferComponentInteraction<T>,
        type: T,
        guild: Guild | null
    ) {
        super(guild);
        this.bot = bot;
        this.interaction = interaction;
        this.type = type;
    }

    // ============================================
    // GETTERS COMMUNS
    // ============================================

    /**
     * Get the user who triggered the interaction
     */
    get user(): User {
        return this.interaction.user;
    }

    /**
     * Get the member who triggered the interaction
     */
    get member(): GuildMember | null {
        return this.interaction.member as GuildMember | null;
    }

    /**
     * Get the channel where the interaction was triggered
     */
    get channel(): TextBasedChannel | null {
        return this.interaction.channel;
    }

    /**
     * Get the custom ID of the component
     */
    get customId(): string {
        return this.interaction.customId;
    }

    /**
     * Get the message associated with the interaction
     */
    get message() {
        return this.interaction.message;
    }

    // ============================================
    // COMMON METHODS
    // ============================================

    /**
     * Get the member who triggered the interaction
     */
    async getMember(): Promise<GuildMember | null> {
        if (!this.guild) return null;
        return await this.guild.members.fetch(this.user.id);
    }

    /**
     * Reply to the interaction
     */
    async reply(
        options: string | MessagePayload | InteractionReplyOptions
    ): Promise<InteractionResponse> {
        return this.interaction.reply(options);
    }

    /**
     * Reply to the interaction with an ephemeral message
     */
    async replyEphemeral(content: string): Promise<InteractionResponse> {
        return this.interaction.reply({
            content,
            ephemeral: true
        });
    }

    /**
     * Defer the reply to the interaction
     */
    async deferReply(ephemeral: boolean = false): Promise<InteractionResponse> {
        return this.interaction.deferReply({ ephemeral });
    }

    /**
     * Edit the reply to the interaction
     */
    async editReply(
        options: string | MessagePayload | InteractionEditReplyOptions
    ): Promise<Message> {
        return this.interaction.editReply(options);
    }

    /**
     * Update the interaction
     */
    async update(
        options: string | MessagePayload | InteractionEditReplyOptions
    ): Promise<InteractionResponse> {
        if ('update' in this.interaction) {
            return this.interaction.update(options);
        }
        throw new Error('This interaction does not support update()');
    }

    /**
     * Defer the update of the interaction
     */
    async deferUpdate(): Promise<InteractionResponse> {
        return this.interaction.deferUpdate();
    }

    /**
     * Delete the reply to the interaction
     */
    async deleteReply(): Promise<void> {
        return this.interaction.deleteReply();
    }

    /**
     * Follow up to the interaction
     */
    async followUp(
        options: string | MessagePayload | InteractionReplyOptions
    ): Promise<Message> {
        return this.interaction.followUp(options);
    }

    // ============================================
    // TYPE GUARDS
    // ============================================

    /**
     * Check if the component is a button
     */
    isButton(): this is ComponentContext<'button'> {
        return this.type === 'button';
    }

    /**
     * Check if the component is a string select menu
     */
    isStringSelect(): this is ComponentContext<'string-select'> {
        return this.type === 'string-select';
    }

    /**
     * Check if the component is a user select menu
     */
    isUserSelect(): this is ComponentContext<'user-select'> {
        return this.type === 'user-select';
    }

    /**
     * Check if the component is a role select menu
     */
    isRoleSelect(): this is ComponentContext<'role-select'> {
        return this.type === 'role-select';
    }

    /**
     * Check if the component is a channel select menu
     */
    isChannelSelect(): this is ComponentContext<'channel-select'> {
        return this.type === 'channel-select';
    }

    /**
     * Check if the component is a mentionable select menu
     */
    isMentionableSelect(): this is ComponentContext<'mentionable-select'> {
        return this.type === 'mentionable-select';
    }

    /**
     * Check if the component is a modal
     */
    isModal(): this is ComponentContext<'modal'> {
        return this.type === 'modal';
    }

    /**
     * Check if the component is a select menu
     */
    isSelectMenu(): boolean {
        return this.type.endsWith('-select');
    }

    // ============================================
    // SELECT MENUS
    // ============================================

    /**
     * Get the values selected in a string select menu
     */
    getValues(): string[] {
        if (!this.isStringSelect()) {
            throw new Error('getValues() is only available for string select menus');
        }
        return this.interaction.values;
    }

    /**
     * Get the users selected in a user select menu
     */
    getUsers(): User[] {
        if (!this.isUserSelect()) {
            throw new Error('getUsers() is only available for user select menus');
        }
        return Array.from(this.interaction.users.values());
    }

    /**
     * Get the roles selected in a role select menu
     */
    getRoles() {
        if (!this.isRoleSelect()) {
            throw new Error('getRoles() is only available for role select menus');
        }

        const interaction = this.interaction as RoleSelectMenuInteraction;
        return Array.from(interaction.roles.values());
    }

    /**
     * Get the channels selected in a channel select menu
     */
    getChannels() {
        if (!this.isChannelSelect()) {
            throw new Error('getChannels() is only available for channel select menus');
        }

        const interaction = this.interaction as ChannelSelectMenuInteraction;
        return Array.from(interaction.channels.values());
    }

    // ============================================
    // MODALS
    // ============================================

    /**
     * Get the value of a field in a modal
     */
    getField(customId: string): string | null {
        if (!this.isModal()) {
            throw new Error('getField() is only available for modals');
        }
        return this.interaction.fields.getTextInputValue(customId) || null;
    }

    /**
     * Get all the fields in a modal
     */
    getAllFields(): Map<string, string> {
        if (!this.isModal()) {
            throw new Error('getAllFields() is only available for modals');
        }

        const fields = new Map<string, string>();

        this.interaction.fields.fields.forEach((field, key) => {
            if ("value" in field) {
                // Champ texte normal
                fields.set(key, field.value);
            } else if ("attachment" in field) {
                // Champ fichier → cast correct
                const attachment = field.attachment as { url?: string; name?: string };

                fields.set(
                    key,
                    attachment.url ?? attachment.name ?? "[file uploaded]"
                );
            }
        });

        return fields;
    }
}