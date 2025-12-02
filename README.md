# 🤖 Harmonix Framework

[![npm version](https://img.shields.io/npm/v/@c1ach0/harmonix.svg)](https://www.npmjs.com/package/@c1ach0/harmonix)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, type-safe Discord.js framework with decorators and advanced features.

⚠️ **TypeScript Only** - JavaScript is not supported.

## ✨ Features

- 🎯 **TypeScript-first** with full type safety
- 🎨 **Decorator-based** commands and events
- 💾 **Built-in database** support (optional)
- 🔌 **Plugin system** for extensibility
- 🚀 **Easy to use** but powerful
- 📦 **Zero config** to get started

## 📦 Installation

```bash
npm install @c1ach0/harmonix
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
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2022",
    "module": "commonjs",
    "strict": true
  }
}
```

### 2. Create your bot

```typescript
// src/index.ts
import { Bot } from '@c1ach0/harmonix';

const bot = new Bot({
  token: process.env.TOKEN!,
  intents: ['Guilds', 'GuildMessages']
});

bot.start();
```

### 3. Create a command

```typescript
// src/commands/ping.ts
import { Command } from '@c1ach0/harmonix';
import { CommandInteraction } from 'discord.js';

@Command({
  name: 'ping',
  description: 'Replies with Pong!'
})
export default class PingCommand {
  async execute(interaction: CommandInteraction) {
    await interaction.reply('Pong! 🏓');
  }
}
```

### 4. Run your bot

```bash
npx tsc
node dist/index.js
```

## 📚 Documentation

Visit our [documentation](https://github.com/c1ach0/harmonix/wiki) for detailed guides and API reference.

## 🔌 Optional Modules

### Database Support

```bash
npm install quick.db
```

```typescript
import { Bot, DatabasePlugin } from '@c1ach0/harmonix';

const bot = new Bot({
  plugins: [
    new DatabasePlugin({ type: 'quickdb' })
  ]
});