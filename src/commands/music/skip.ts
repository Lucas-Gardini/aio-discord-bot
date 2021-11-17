import { Command } from "../../structures/Command";
import { play, getNextMusic, download } from "./play";

export default new Command({
	name: "skip",
	description: "Toca a próxima música",
	run: async ({ interaction }) => {
		play(await download(getNextMusic(true)));
		interaction.followUp("Pulando música...");
	},
});
