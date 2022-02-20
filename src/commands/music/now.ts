import { Command } from "../../structures/Command";
import { readFileSync } from "fs";
import { MessageEmbed } from "discord.js";
import Innertube from "youtubei.js";

interface IQueueItem {
	id: string;
	title: string;
	playing: boolean;
}

export default new Command({
	name: "now",
	description: "Mostra a música que está tocando no momento",
	run: async ({ interaction }) => {
		const youtubeManager = await new Innertube();

		const { queue } = JSON.parse(readFileSync(`${__dirname}/queue.json`).toString());
		let playing: boolean = false;
		for (const item of queue) {
			if (item.playing) {
				playing = true;

				const video = (await youtubeManager.search(item.title)).videos[0];
				const embed = new MessageEmbed();
				video.metadata.thumbnails
					? embed.setThumbnail(video.metadata.thumbnails[0].url)
					: embed.setThumbnail(video.thumbnail.url);
				embed.setTitle(video.title);
				embed.setAuthor({
					name: "Adicionado a fila:",
					url: `https://www.youtube.com/watch?v=${item.id}`,
				});
				video.metadata.thumbnails &&
					embed.setDescription(
						`${video.description}\n\nDuração: ${video.metadata.duration.simple_text}`
					);
				video.metadata.thumbnails && embed.setFooter({ text: video.author });
				return interaction.followUp({ embeds: [embed] });
			}
		}

		if (!playing) {
			return interaction.followUp("Não há músicas tocando no momento");
		}
	},
});
