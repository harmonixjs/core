# 🤖 Harmonix Framework

[![npm version](https://img.shields.io/npm/v/@harmonixjs/core.svg)](https://www.npmjs.com/package/@harmonixjs/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, type-safe Discord.js framework with decorators and advanced features.

## Typed decorators without repeated generics

Decorated classes are the primary HarmonixJS API. Create a typed decorator
definition once, then reuse it for the class and its inferred handler:

```ts
const GuildCreated = Event(Events.GuildCreate);

@GuildCreated
export default class GuildCreatedEvent {
  execute = GuildCreated.handler(async (bot, guild) => {
    // guild is inferred as Guild
  });
}

const Ping = Command({
  name: "ping",
  description: "Ping",
  type: "prefix"
});

@Ping
export default class PingCommand {
  execute = Ping.handler(async (bot, ctx) => {
    // ctx is inferred as CommandContext<"prefix">
  });
}
```

No `implements EventExecutor<...>` or `implements CommandExecutor<...>` is
required. The `defineEvent`, `defineCommand`, and `defineComponent` helpers
remain available as a secondary functional API.

Application events are declared once through module augmentation:

```ts
declare module "@harmonixjs/core" {
  interface HarmonixCustomEvents {
    "guild:configured": [guildId: string, enabled: boolean];
  }
}

bot.events.on("guild:configured", (bot, guildId, enabled) => {
  // bot is always injected as the first argument
});

await bot.events.emitAsync("guild:configured", guild.id, true);
```

Providers use the same typed registry pattern:

```ts
declare module "@harmonixjs/core" {
  interface HarmonixProviderRegistry {
    notifications: NotificationProvider;
  }
}

const bot = new Harmonix({
  // ...
  providers: [new NotificationProvider()]
});

bot.providers.notifications.send();
```

⚠️ **TypeScript Only** - JavaScript is not supported.

## ✨ Features

- 🎯 **TypeScript-first** with full type safety
- 🎨 **Decorator-based** commands and events
- 📥 **Automatic imports** so you write less and code faster
- 🔌 **Plugin system** for extensibility
- 🚀 **Easy to use** with minimal setup

## 📦 Installation

```bash
npm install @harmonixjs/core tsx discord.js
npm install --save-dev typescript
```

## 🚀 Quick Start

### 1. Initialize TypeScript

```bash
npx tsc --init
```

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "dist",
    "esModuleInterop": true
  }
}
```

### 2. Create your bot

```typescript
// src/index.ts
import { Harmonix } from "@harmonixjs/core";
import { DatabasePlugin } from "@harmonixjs/quick-db";

interface User {
  id: string;
  coins: number;
}

const bot = new Harmonix({
  bot: {
    id: "YOUR_BOT_CLIENT_ID",
    token: "YOUR_BOT_TOKEN"
  },
  publicApp: true,
  folders: {
    commands: "./src/commands",
    events: "./src/events",
    components: "./src/components"
  },
  plugins: [
    new DatabasePlugin()
  ],
  intents: [3249151] // (All Intents)
});

// The plugin name and type are inferred automatically.
const users = bot.plugins.database.table<User>("users");

// Start listening
bot.start();
```

### 3. Create a command / event / component

```typescript
// src/commands/Ping.ts
const Ping = Command({
  name: "ping",
  description: "Ping command"
});

@Ping
export default class PingCommand {
  execute = Ping.handler(async (bot, ctx) => {
    await ctx.reply(`Pong! ${bot.ws.ping}ms`);
  });
}
```

```typescript
// src/events/Ready.ts
const Ready = Event(Events.ClientReady);

@Ready
export default class ClientReady {
  execute = Ready.handler((bot, client) => {
    bot.logger.sendLog("SUCCESS", `Bot is ready! Logged in as ${client.user.tag}`);
  });
}
```

```typescript
// src/components/TestButton.ts
const TestButton = Component({ id: "test_button" });

@TestButton
export default class TestButtonComponent {
  execute = TestButton.handler(async (bot, ctx) => {
    await ctx.reply("Test button clicked!");
  });
}
```

### 4. Run your bot

```bash
npx tsx src/index.ts
```

## 📚 Documentation

<!-- Visit our [documentation](https://github.com/harmonixjs/core/wiki) for detailed guides and API reference. -->

## 🔌 Plugins

Harmonix supports first-class plugins — you can add plugins directly to the framework to register commands, events, middleware, or extend internals.

Official and third-party plugins can augment the typed registry:

```typescript
export class MyPlugin implements HarmonixPlugin {
  readonly name = "myPlugin" as const;

  init(bot: Harmonix) {
    // Initialize the plugin.
  }
}

declare module "@harmonixjs/core" {
  interface HarmonixPluginRegistry {
    myPlugin: MyPlugin;
  }
}
```

Applications can then use `bot.plugins.myPlugin` without a generic, optional chaining, or a non-null assertion. Accessing a plugin that was not registered throws an explicit runtime error.

### Application command capabilities

Harmonix forwards Discord.js application-command options directly:

```typescript
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ApplicationIntegrationType,
  InteractionContextType
} from "discord.js";

@Command({
  name: "profile",
  description: "Display a profile",
  contexts: [
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
    InteractionContextType.PrivateChannel
  ],
  integrationTypes: [
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall
  ],
  options: [{
    name: "user",
    description: "The user to display",
    type: ApplicationCommandOptionType.User
  }]
})
```

User and message context commands are also supported:

```typescript
@Command({
  name: "View profile",
  type: "user",
  applicationType: ApplicationCommandType.User
})
```

- **[@harmonixjs/quick-db](https://www.npmjs.com/package/@harmonixjs/quick-db)**: Simple and flexible Quick.db plugin for Harmonix Discord framework.
- **[@harmonixjs/express](https://www.npmjs.com/package/@harmonixjs/express)**: A powerful Express-based HTTP API plugin for the Harmonix Discord framework.
- **@harmonixjs/i18n**: Runtime translations and Discord command localization.
- **@harmonixjs/shard**: Automatic multi-process sharding using Discord's recommended shard count.
- **[@harmonixjs/image-builder](#plugins)**: Development..
