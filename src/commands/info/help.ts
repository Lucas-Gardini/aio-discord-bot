import { Command } from "../../structures/Command";
import { CommandType } from "../../typings/Command";
import glob from "glob";
import { promisify } from "util";
import { MessageEmbed } from "discord.js";

const asyncGlob = promisify(glob);

async function importFile(filePath: string) {
	return (await import(filePath))?.default;
}

async function getAllCommands(): Promise<string[]> {
	// Commands
	const commandFiles = await asyncGlob(`${__dirname}/../**/*{.ts,.js}`);
	return commandFiles;
}

export default new Command({
	name: "help",
	description: "Retorna todos os comandos do bot",
	run: async ({ interaction }) => {
		let embed = new MessageEmbed();
		embed.setAuthor("Ajuda");
		embed.setColor("#00FF7F");
		let commandsIndex = 0;
		const allCommands = await getAllCommands();
		allCommands.forEach(async (filePath) => {
			const command: CommandType = await importFile(filePath);
			if (!command.name) return;
			embed.addField(`${command.name}`, `${command.description}`);

			commandsIndex++;
			if (commandsIndex >= allCommands.length) {
				interaction.followUp({ embeds: [embed] });
			}
		});
	},
});
