import { Harmonix, Command, CommandContext, CommandExecutor } from "../../src";

@Command({
    name: "test",
    description: "A test command",
})
export default class TestCommand implements CommandExecutor {
    execute(bot: Harmonix, ctx: CommandContext) {
        ctx.reply("Test command executed!");
    }
}