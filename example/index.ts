import { Harmonix, BotConfig } from "../src";

const botConfig: BotConfig = {
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
  intents: []
};

const bot = new Harmonix(botConfig);

// Register a plugin
// bot.use(...);

// Start listening
bot.login(botConfig.bot.token);