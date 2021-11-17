import { Client, Collection, ApplicationCommandDataResolvable, ClientEvents } from "discord.js";
import { CommandType } from "../typings/Command";
import { RegisterCommandsOptions } from "../typings/Client";
import { Event } from "./Event";
import glob from "glob";
import { promisify } from "util";

const asyncGlob = promisify(glob);

export class ExtendedClient extends Client {
	public commands: Collection<string, CommandType> = new Collection();

	constructor() {
		super({ intents: 32767 });
	}

	start() {
		this.registerModules();
		this.login(process.env.token);
	}

	async importFile(filePath: string) {
		return (await import(filePath))?.default;
	}

	async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
		if (guildId) {
			this.guilds.cache.get(guildId)?.commands.set(commands);
			console.log(`Registered ${commands.length} commands for guild ${guildId}`);
		} else {
			this.application?.commands.set(commands);
			console.log(`Registered ${commands.length} commands for the application`);
		}
	}

	async registerModules() {
		// Commands
		const slashCommands: ApplicationCommandDataResolvable[] = [];
		const commandFiles = await asyncGlob(`${__dirname}/../commands/**/*{.ts,.js}`);

		commandFiles.forEach(async (filePath) => {
			const command: CommandType = await this.importFile(filePath);
			if (!command.name) return;

			this.commands.set(command.name, command);
			slashCommands.push(command);
		});

		this.on("ready", () => {
			this.registerCommands({
				commands: slashCommands,
				guildId: process.env.guildId,
			});
		});

		// Events
		const eventFiles = await asyncGlob(`${__dirname}/../events/**/*{.ts,.js}`);
		eventFiles.forEach(async (filePath) => {
			const event: Event<keyof ClientEvents> = await this.importFile(filePath);
			if (!event) return;

			this.on(event.event, event.run);
		});
	}
}
