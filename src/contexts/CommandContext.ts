import {
  CacheType,
  ChatInputCommandInteraction,
  CommandInteractionOption,
  GuildMember,
  InteractionReplyOptions,
  InteractionResponse,
  Message,
  MessageCreateOptions,
  MessagePayload,
  MessageReplyOptions,
  Role,
  User,
  Guild
} from "discord.js";
import { Harmonix } from "../client/Bot";
import { CommandType, InferInteractionType } from "../types/CommandTypes.js";
import ExtendsChannel from "../structures/ExtendsChannel";

export interface PrefixCommandOptions {
  prefix: string;
  commandName: string;
}

export class CommandContext<T extends CommandType = 'slash'> extends ExtendsChannel {
  public readonly bot: Harmonix;
  public readonly interaction: InferInteractionType<T>;
  public readonly type: T;
  private readonly prefixOptions?: PrefixCommandOptions;

  constructor(
    bot: Harmonix,
    interaction: InferInteractionType<T>,
    type: T,
    guild: Guild | null,
    prefixOptions?: PrefixCommandOptions
  ) {
    super(guild);
    this.bot = bot;
    this.interaction = interaction;
    this.type = type;
    this.prefixOptions = prefixOptions;
  }

  get event(): T { return this.type; }
  get currentChannel() { return this.interaction.channel };
  get user() { return this.interaction.member.user; }

  // ============================================
  // MÉTHODES COMMUNES
  // ============================================

  /**
   * Get the GuildMember of the user who triggered the command
   */
  async getMember() {
    return await this.guild?.members.fetch(this.user.id);
  }

  /**
   * Reply to the command interaction or message
   */
  async reply(
    options: string | MessagePayload | InteractionReplyOptions | MessageReplyOptions
  ): Promise<Message | InteractionResponse> {
    if (this.interaction instanceof Message) {
      return this.interaction.reply(options as string | MessagePayload | MessageReplyOptions);
    } else {
      return this.interaction.reply(options as string | MessagePayload | InteractionReplyOptions);
    }
  }

  /**
   * Send a message to the current channel
   */
  async send(options: string | MessagePayload | MessageCreateOptions): Promise<Message> {
    if (!this.currentChannel?.isSendable()) {
      throw new Error("Channel is not sendable");
    }
    return this.currentChannel.send(options);
  }

  // ============================================
  // TYPE GUARDS
  // ============================================

  /**
   * Check if the command is a prefix command
   */
  isSlashCommand(): this is CommandContext<'slash'> {
    return this.interaction instanceof ChatInputCommandInteraction;
  }

  /**
   * Check if the command is a prefix command
   */
  isPrefixCommand(): this is CommandContext<'prefix'> {
    return this.interaction instanceof Message;
  }

  // ============================================
  // SLASH COMMANDS
  // ============================================

  /**
   * Get the subcommand or subcommand group used
   * Only for slash commands
   * @returns readonly CommandInteractionOption<CacheType>[]
   * @throws Error if not a slash command
   */
  getSubcommand(): string | null {
    if (!this.isSlashCommand()) {
      throw new Error("getSubcommand() is only available for slash commands");
    }

    try {
      return this.interaction.options.getSubcommand();
    } catch {
      return null;
    }
  }

  /**
   * Get the subcommand group used
   * Only for slash commands
   * @returns readonly CommandInteractionOption<CacheType>[]
   * @throws Error if not a slash command
   */
  getSubcommandGroup(): string | null {
    if (!this.isSlashCommand()) {
      throw new Error("getSubcommandGroup() is only available for slash commands");
    }

    try {
      return this.interaction.options.getSubcommandGroup();
    } catch {
      return null;
    }
  }

  /**
   * Get a specific option by its name
   * Only for slash commands
   * @throws Error if not a slash command
   */
  getOption<Y extends string | number | boolean = string | number | boolean>(
    name: string
  ): CommandInteractionOptionEdited<Y> | null {
    if (!this.isSlashCommand()) {
      throw new Error("getOption() is only available for slash commands");
    }

    const option = this.interaction.options.get(name);
    if (!option) return null;

    return new CommandInteractionOptionEdited<Y>(option, option.value as Y);
  }

  /**
   * Get all options provided in the command
   * Only for slash commands
   * @throws Error if not a slash command
   */
  getOptions(): readonly CommandInteractionOption<CacheType>[] {
    if (!this.isSlashCommand()) {
      throw new Error("getOptions() is only available for slash commands");
    }
    return this.interaction.options.data;
  }

  // ============================================
  // PRRFIX COMMANDS
  // ============================================

  /**
   * Get the arguments passed to the command
   * Only for prefix commands
   * @throws Error if not a prefix command
   */
  getArgs(): string[] {
    if (!this.isPrefixCommand()) {
      throw new Error("getArgs() is only available for prefix commands");
    }

    if (!this.prefixOptions) return [];

    const { prefix, commandName } = this.prefixOptions;
    const contentLength = prefix.length + commandName.length;
    const argsString = this.interaction.content.slice(contentLength).trim();

    return argsString ? argsString.split(/\s+/) : [];
  }

  /**
   * Get a specific argument by its index
   * Only for prefix commands
   * @throws Error if not a prefix command
   */
  getArg(index: number): string | undefined {
    if (!this.isPrefixCommand() || !this.prefixOptions) {
      throw new Error("getArg() is only available for prefix commands");
    }
    return this.getArgs()[index];
  }

  /**
   * Get the arguments as a single string
   * Only for prefix commands
   * @throws Error if not a prefix command
   */
  getArgsString(): string {
    if (!this.isPrefixCommand() || !this.prefixOptions) {
      throw new Error("getArgsString() is only available for prefix commands");
    }
    return this.getArgs().join(' ');
  }

  /**
   * Get the prefix used for the command
   * Only for prefix commands
   * @throws Error if not a prefix command
   */
  getPrefix(): string {
    if (!this.isPrefixCommand() || !this.prefixOptions) {
      throw new Error("getPrefix() is only available for prefix commands");
    }
    return this.prefixOptions.prefix;
  }

  /**
   * Get the command name used
   * Only for prefix commands
   * @throws Error if not a prefix command
   */
  getCommandName(): string {
    if (!this.isPrefixCommand() || !this.prefixOptions) {
      throw new Error("getCommandName() is only available for prefix commands");
    }
    return this.prefixOptions.commandName;
  }
}


// ============================================
// COMMAND OPTION WRAPPER
// ============================================

class CommandInteractionOptionEdited<Y extends string | number | boolean = string | number | boolean>
  implements CommandInteractionOption<CacheType> {

  name: string;
  type: number;
  focused: boolean;
  user?: User;
  member?: GuildMember | any;
  channel?: any;
  role?: Role | any;
  value?: Y;

  constructor(base: CommandInteractionOption<CacheType>, value?: Y) {
    this.name = base.name;
    this.type = base.type;
    this.focused = base.focused;
    this.user = base.user;
    this.member = base.member;
    this.channel = base.channel;
    this.role = base.role;
    this.value = value ?? (base.value as Y);
  }

  get baseValue() {
    return this.value;
  }
}