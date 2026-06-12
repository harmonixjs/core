# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-12-01

### Added
- Initial release
- Decorator-based command system
- Event handler
- Database integration (optional)
- Plugin system
- TypeScript-only framework
# 2.0.0

- Updated Discord.js to 14.26.4.
- Added typed plugin registry and `bot.plugins`.
- Added typed provider registry and `bot.providers`.
- Added `bot.events` and scoped typed custom event emitters with automatic bot injection.
- Added typed decorator definitions with `.handler(...)` inference, removing the
  need to repeat executor generics while keeping decorators as the primary API.
- Added `defineEvent`, `defineCustomEvent`, `defineCommand` and `defineComponent`
  as an alternative functional API.
- Added automatic plugin registration through `BotConfig.plugins`.
- Added application command localization, contexts, integration types and NSFW metadata.
- Added user and message context commands.
- Added support for the latest modal radio, checkbox and file-upload fields.
- Made handler loading deterministic before command registration and login.
- Fixed command execution continuing after a cooldown response.
