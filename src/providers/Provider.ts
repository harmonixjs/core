import type { Harmonix } from "../client/Bot";

/**
 * Provider packages and applications extend this interface through module
 * augmentation to type bot.providers.
 */
export interface HarmonixProviderRegistry {}

export type HarmonixProviders = Readonly<HarmonixProviderRegistry>;

export interface HarmonixProvider<Name extends string = string> {
    readonly name: Name;
    init(bot: Harmonix): void | Promise<void>;
}

export function defineProvider<Provider extends HarmonixProvider>(
    provider: Provider
): Provider {
    return provider;
}
