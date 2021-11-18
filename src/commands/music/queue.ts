import { MessageEmbed } from "discord.js";
import { Command } from "../../structures/Command";
import { readFileSync } from "fs";

export default new Command({
	name: "queue",
	description: "Mostra todas as músicas na fila",
	run: async ({ interaction }) => {
		const { queue } = JSON.parse(readFileSync(`${__dirname}/queue.json`).toString());
		let embed = new MessageEmbed();
		embed.setAuthor("Fila");
		embed.setColor("#00FF7F");
		let index = 0;
		queue.forEach((music) => {
			index++;
			if (index >= 24) return;
			embed.addField(`${index}. ${music.title}`, `[${music.url}](${music.url})`);
		});
		interaction.followUp({ embeds: [embed] });
	},
});
