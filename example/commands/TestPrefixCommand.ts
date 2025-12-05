import { Command, CommandContext, CommandExecutor, Harmonix } from "../../src";


@Command({
    name: "test",
    description: "A test command",
    type: "prefix"
})
export default class TestPrefixCommand implements CommandExecutor<'prefix'> {
    execute(bot: Harmonix, ctx: CommandContext<"prefix">) {
        ctx.reply("Test prefix command executed!");
    }
}