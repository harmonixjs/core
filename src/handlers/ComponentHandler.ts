import { Harmonix } from "../client/Bot";
import fs, { statSync } from "fs";
import { join, resolve } from "path";
import chalk from "chalk";
import 'reflect-metadata';
import { ComponentOptions } from "../decorators/Component";
import { ComponentExecutor } from "../executors/ComponentExecutor";

export default async function RegisterComponent(bot: Harmonix, dir: string): Promise<void> {
    await loadComponents(bot, resolve(process.cwd(), dir));
}

async function loadComponents(bot: Harmonix, dir: string): Promise<void> {
    for (const file of fs.readdirSync(dir)) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            await loadComponents(bot, filePath);
            continue;
        }

        if ((!file.endsWith(".js") && !file.endsWith(".ts")) || file.endsWith(".d.ts")) {
            continue;
        }

        const ComponentClass = (await import(filePath)).default;
        const metadata: ComponentOptions | undefined = Reflect.getMetadata(
            "component:options",
            ComponentClass
        );

        if (!metadata) {
            console.log(chalk.yellow(`File '${file}' does not have a valid @Component decorator.`));
            continue;
        }

        if (!metadata.id) {
            console.log(chalk.red(`Component in '${file}' is missing an id.`));
            continue;
        }

        const instance: ComponentExecutor = new ComponentClass();
        if (typeof instance.execute !== "function") {
            console.log(chalk.red(`Component '${metadata.id}' has no execute() method.`));
            continue;
        }

        bot.components.set(metadata.id, ComponentClass);
        console.log(chalk.green(`Component '${metadata.id}' registered.`));
    }
}
