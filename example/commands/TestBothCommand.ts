import { Command, CommandContext, CommandExecutor, Harmonix } from "../../src";


@Command({
    name: "test-both",
    description: "A test command for both slash and prefix",
    type: "both"
})
export default class TestBothCommand implements CommandExecutor<"both"> {
    execute(bot: Harmonix, ctx: CommandContext<"both">) {
        ctx.reply("Test both command executed!");
    }
}