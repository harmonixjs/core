import { Component, ComponentContext, ComponentExecutor, Harmonix } from "../../src";


@Component({
    id: "test_select",
    type: "string-select",
})
export default class TestSelect implements ComponentExecutor<"string-select"> {
    execute(bot: Harmonix, ctx: ComponentContext<"string-select">) {
        ctx.reply("Test select menu option selected!");
    }
}