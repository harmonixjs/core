import { Harmonix } from "../client/Bot";
import { EventExecutor } from "../executors/EventExecutor";
import fs, { statSync } from "fs";
import { join, resolve } from "path";
import chalk from "chalk";
import { ClientEvents } from "discord.js";
import type {
    HarmonixCustomEvents,
    HarmonixEventListener
} from "../events/HarmonixEventEmitter";

export default async function RegisterEvents(client: Harmonix, dir: string): Promise<void> {
    await loadEvents(client, resolve(process.cwd(), dir));
    await loadEvents(client, join(__dirname, '..', 'modules'));
}

async function loadEvents(client: Harmonix, dir: string): Promise<void> {
    for (const file of fs.readdirSync(dir)) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            await loadEvents(client, filePath);
            continue;
        }

        if ((!file.endsWith(".js") && !file.endsWith(".ts")) || file.endsWith(".d.ts")) {
            continue;
        }

        const EventClass = require(filePath).default;
        const eventOn: keyof ClientEvents = Reflect.getMetadata("event:event", EventClass);
        const source: "discord" | "custom" =
            Reflect.getMetadata("event:source", EventClass) ?? "discord";

        if (!eventOn) {
            console.log(chalk.yellow(`File '${file}' does not have a valid Event decorator.`));
            continue;
        }

        if (source === "custom") {
            const customEvent = eventOn as keyof HarmonixCustomEvents;
            const eventListenerInstance = new EventClass() as {
                execute: HarmonixEventListener<HarmonixCustomEvents, typeof customEvent>;
            };
            client.events.on(
                customEvent,
                (bot, ...args) => eventListenerInstance.execute(bot, ...args)
            );
            console.log(chalk.green(`Custom event '${String(customEvent)}' registered.`));
            continue;
        }

        const eventListenerInstance: EventExecutor<typeof eventOn> = new EventClass();
        client.on(eventOn, async (...args: ClientEvents[typeof eventOn]) => {
            try {
                await eventListenerInstance.execute(client, ...args);
            } catch (error) {
                console.error(`Event error '${eventOn}':`, error);
            }
        });

        console.log(chalk.green(`Event '${eventOn}' registered.`));
    }
}
