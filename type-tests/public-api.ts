import { Events, Guild } from "discord.js";
import {
    Command,
    Component,
    CustomEvent,
    defineCommand,
    defineComponent,
    defineCustomEvent,
    defineEvent,
    Event,
    Harmonix,
    HarmonixProvider
} from "@harmonixjs/core";

class CacheProvider implements HarmonixProvider<"cache"> {
    readonly name = "cache";

    get(key: string): string | undefined {
        return key || undefined;
    }

    init(_bot: Harmonix) {}
}

declare module "@harmonixjs/core" {
    interface HarmonixCustomEvents {
        "guild:configured": [guild: Guild, enabled: boolean];
    }

    interface HarmonixProviderRegistry {
        cache: CacheProvider;
    }
}

declare const bot: Harmonix;

const prefixCommand = Command({
    name: "prefix",
    description: "Prefix command",
    type: "prefix"
});

@prefixCommand
class PrefixCommand {
    execute = prefixCommand.handler((_bot, ctx) => {
        ctx.type satisfies "prefix";
        ctx.interaction.content satisfies string;
    });
}

const roleComponent = Component({ id: "role", type: "role-select" });

@roleComponent
class RoleComponent {
    execute = roleComponent.handler((_bot, ctx) => {
        ctx.type satisfies "role-select";
        ctx.interaction.values satisfies string[];
    });
}

const guildCreateEvent = Event(Events.GuildCreate);

@guildCreateEvent
class GuildCreateEvent {
    execute = guildCreateEvent.handler((_bot, guild) => {
        guild.id satisfies string;
    });
}

const configuredEvent = CustomEvent("guild:configured");

@configuredEvent
class ConfiguredEvent {
    execute = configuredEvent.handler((_bot, guild, enabled) => {
        guild.id satisfies string;
        enabled satisfies boolean;
    });
}

bot.events.on("guild:configured", (injectedBot, guild, enabled) => {
    injectedBot.providers.cache.get(guild.id);
    enabled satisfies boolean;
});
bot.events.emit("guild:configured", {} as Guild, true);
bot.providers.cache.get("key");

defineEvent(Events.GuildCreate, (_bot, guild) => {
    guild.id satisfies string;
});

defineCustomEvent("guild:configured", (_bot, guild, enabled) => {
    guild.id satisfies string;
    enabled satisfies boolean;
});

defineCommand({ name: "ping", description: "Ping", type: "prefix" }, (_bot, ctx) => {
    ctx.type satisfies "prefix";
    ctx.interaction.content satisfies string;
});

defineComponent({ id: "role", type: "role-select" }, (_bot, ctx) => {
    ctx.type satisfies "role-select";
    ctx.interaction.values satisfies string[];
});

// @ts-expect-error The event requires a Guild followed by a boolean.
bot.events.emit("guild:configured", true);
