import { Command } from "../../structures/Command";
import { download, stop } from "./play";
import { writeFileSync } from "fs";

export default new Command({
	name: "clear",
	description: "Limpa a playlist",
	run: async ({ interaction }) => {
		writeFileSync(`${__dirname}/queue.json`, JSON.stringify([]));
		stop();
		interaction.followUp("Limpando playlist...");
	},
});
