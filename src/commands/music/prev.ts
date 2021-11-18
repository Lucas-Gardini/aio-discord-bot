import { Command } from "../../structures/Command";
import { play, getPreviousMusic, download } from "./play";

export default new Command({
	name: "prev",
	description: "Volta para a música anterior",
	run: async ({ interaction }) => {
		play(await download(getPreviousMusic()));
		interaction.followUp("Voltando uma música...");
	},
});
