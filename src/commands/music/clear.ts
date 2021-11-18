import { Command } from "../../structures/Command";
import { download, getNextMusic, play } from "./play";
import { writeFileSync } from "fs";

export default new Command({
	name: "clear",
	description: "Limpa a playlist",
	run: async ({ interaction }) => {
		writeFileSync(`${__dirname}/queue.json`, JSON.stringify([]));
		play(await download(getNextMusic(true)));
		interaction.followUp("Limpando playlist...");
	},
});
