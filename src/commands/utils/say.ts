import { Command } from "../../structures/Command";

export default new Command({
	name: "say",
	description: "Faz o bot dizer QUALQUER coisa",
	options: [{ name: "frase", description: "Frase que o bot irá falar", type: "STRING", required: true }],
	run: async ({ interaction }) => {
		interaction.channel.send(interaction.options.getString("frase"));
	},
});
