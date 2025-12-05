# 🤖 Harmonix Framework

[![npm version](https://img.shields.io/npm/v/@harmonixjs/core.svg)](https://www.npmjs.com/package/@harmonixjs/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, type-safe Discord.js framework with decorators and advanced features.

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
  intents: [3249151] // (All Intents)
});

// Register a plugin
bot.use(...);

// Start listening
bot.login(botConfig.bot.token);
```

### 3. Create a command / event / component

```typescript
// src/commands/Ping.ts
@Command({
    name: "ping",
    description: "Ping command",
})
export default class PingCommand implements CommandExecutor {
    execute(bot: Harmonix, ctx: CommandContext) {
        ctx.reply("Pong!");
    }
}

// src/commands/PingPrefix.ts
@Command({
    name: "ping",
    description: "Ping command",
    type: 'prefix'
})
export default class PingPrefixCommand implements CommandExecutor<"prefix"> {
    execute(bot: Harmonix, ctx: CommandContext<"prefix">) {
        ctx.reply("Pong!");
    }
}
```

```typescript
// src/events/Ready.ts
@Event(Events.ClientReady)
export default class ClientReady implements EventExecutor<Events.ClientReady> {
    execute(bot: Harmonix, client: Client<true>) {
        bot.logger.sendLog("SUCCESS", `Bot is ready! Logged in as ${client.user.tag}`);
    }
}
```

```typescript
// src/components/TestButton.ts
@Component({
    id: "test_button"
})
export default class TestButton implements ComponentExecutor {
    execute(bot: Harmonix, ctx: ComponentContext) {
        ctx.reply("Test button clicked!");
    }
}

// src/components/TestSelect.ts
@Component({
    id: "test_button"
    type: "string-select"
})
export default class TestSelect implements ComponentExecutor<"string-select"> {
    execute(bot: Harmonix, ctx: ComponentContext<"string-select">) {
        //...
    }
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

- **[@harmonixjs/quick-db](https://www.npmjs.com/package/@harmonixjs/quick-db)**: Simple and flexible Quick.db plugin for Harmonix Discord framework.
- **[@harmonixjs/express](https://www.npmjs.com/package/@harmonixjs/express)**: A powerful Express-based HTTP API plugin for the Harmonix Discord framework.
- **[@harmonixjs/image-builder](#plugins)**: Development..