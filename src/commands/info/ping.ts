import { Command } from "../../structures/Command";

export default new Command({
	name: "ping",
	description: "Retorna pong!",
	run: async ({ interaction }) => {
		interaction.followUp("Pong!");
	},
});
