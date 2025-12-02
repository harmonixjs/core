import { CacheType, ChatInputCommandInteraction, Collection, Events, Interaction, MessageFlags } from "discord.js"
import { Harmonix } from "../client/Bot";
import { Event } from "../decorators/Event";
import { EventExecutor } from "../executors/EventExecutor";
import { CommandContext } from "../contexts/CommandContext";
import { CommandExecutor } from "../executors/CommandExecutor";
import { AutoCompletion } from "../executors/AutoCompletion";
import { ComponentContext } from "../contexts/ComponentContext";
import { ComponentExecutor } from "../executors/ComponentExecutor";
import { CommandOptions } from "../decorators/Command";
import { Cooldown } from "../executors/Cooldown";

@Event(Events.InteractionCreate)
export default class InteractionCreate implements EventExecutor<Events.InteractionCreate> {
  private bot: Harmonix;

  async execute(bot: Harmonix, interaction: Interaction<CacheType>) {
    this.bot = bot;

    if (interaction.isChatInputCommand()) {
      if (!await this.authorizedToExecute(interaction)) return;
      await this.handleCooldown(interaction);
      
      const command = bot.commands.get('slash')?.get(interaction.commandName);
      if (!command) return;
      const commandInstance: CommandExecutor = new command();
      await commandInstance.execute(bot, new CommandContext<ChatInputCommandInteraction>(interaction));
    }

    else if (interaction.isAutocomplete()) {
      const autoCompletion = bot.commands.get('slash')?.get(interaction.commandName);
      if (!autoCompletion) return;
      const autoCompletionInstance: AutoCompletion = new autoCompletion();
      if (!autoCompletionInstance.autoCompletion) return;
      autoCompletionInstance.autoCompletion(bot, interaction, []);
    }

    else if (
      interaction.isButton() ||
      interaction.isStringSelectMenu() ||
      interaction.isUserSelectMenu?.() ||
      interaction.isRoleSelectMenu?.() ||
      interaction.isChannelSelectMenu?.() ||
      interaction.isMentionableSelectMenu?.()
    ) {
      const component = bot.components.get(interaction.customId);
      if (!component) return;
      const ctx: ComponentContext<typeof interaction> = new ComponentContext<typeof interaction>(interaction);
      const componentInstance: ComponentExecutor<typeof interaction> = new component();
      await componentInstance.execute(bot, ctx);
    }
  }

  private async handleCooldown(interaction: ChatInputCommandInteraction) {
    const commandName = interaction.commandName;

    if (!this.bot.cooldowns.has(commandName)) {
      this.bot.cooldowns.set(commandName, new Collection());
    }

    const now = Date.now();
    const userId = interaction.user.id;
    const guildId = interaction.guildId ?? `dm-${userId}`;
    const timestamps = this.bot.cooldowns.get(commandName)!;

    const defaultCooldown = 3;
    const commandClass = this.bot.commands.get('slash')?.get(commandName);
    if (!commandClass) return;

    const commandAnnotation: CommandOptions = Reflect.getMetadata('command:options', commandClass) ?? {};

    const userCooldownMs = (commandAnnotation.user_cooldown ?? defaultCooldown) * 1000;
    const guildCooldownMs = (commandAnnotation.guild_cooldown ?? 0) * 1000;

    const userKey = `user-${userId}`;
    const guildKey = `guild-${guildId}`;

    const sendCooldownReply = async (expirationTime: number) => {
      const expiredTimestamp = Math.floor(expirationTime / 1000);

      const hasCooldownExecutor = typeof commandClass.prototype.cooldown === "function";

      if (!interaction.replied && !interaction.deferred) {
        if (hasCooldownExecutor) {
          const ctx = new CommandContext<ChatInputCommandInteraction>(interaction);
          const commandInstance: Cooldown<ChatInputCommandInteraction> = new commandClass();
          const result = await commandInstance.cooldown(this.bot, ctx, expiredTimestamp);
          await interaction.reply(result);
        } else {
          await interaction.reply({
            content: `You can use this command again <t:${expiredTimestamp}:R>.`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    };

    if (userCooldownMs > 0 && timestamps.has(userKey)) {
      const expirationTime = timestamps.get(userKey)! + userCooldownMs;
      if (now < expirationTime) {
        await sendCooldownReply(expirationTime);
        return;
      }
    }

    if (guildCooldownMs > 0 && timestamps.has(guildKey)) {
      const expirationTime = timestamps.get(guildKey)! + guildCooldownMs;
      if (now < expirationTime) {
        await sendCooldownReply(expirationTime);
        return;
      }
    }

    if (userCooldownMs > 0) {
      timestamps.set(userKey, now);
      setTimeout(() => timestamps.delete(userKey), userCooldownMs);
    }

    if (guildCooldownMs > 0) {
      timestamps.set(guildKey, now);
      setTimeout(() => timestamps.delete(guildKey), guildCooldownMs);
    }
  }

  async authorizedToExecute(interaction: ChatInputCommandInteraction): Promise<boolean> {
    const commandClass = this.bot.commands.get('slash')?.get(interaction.commandName);
    if (!commandClass) return false;

    const commandOptions: CommandOptions = Reflect.getMetadata('command:options', commandClass) ?? {};
    if (!commandOptions) return true;

    if (commandOptions.member_permission) {
      const member = interaction.guild.members.cache.get(interaction.user.id);

      if (!member.permissions.has(commandOptions.member_permission)) {
        await interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
        return false;
      }
    }

    return true;
  }
}