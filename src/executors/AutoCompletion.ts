import { Harmonix } from "../client/Bot";
import {
    AutocompleteInteraction,
    ApplicationCommandOptionChoiceData
} from "discord.js";

/**
 * Interface for auto-completion handlers in Harmonix.
 * Handles the auto-complete logic for slash command options.
 */
export interface AutoCompletion {
    /**
     * Executes the auto-completion logic for a slash command option.
     * @param bot - The Harmonix bot instance
     * @param interaction - The Discord autocomplete interaction
     * @param choices - Array of choices to populate dynamically
     */
    autoCompletion(bot: Harmonix, interaction: AutocompleteInteraction, choices: ApplicationCommandOptionChoiceData<string | number>[]): Promise<any> | any;
}