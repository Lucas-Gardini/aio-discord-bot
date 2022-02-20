import { Command } from "../../structures/Command";
import { MessageEmbed } from "discord.js";

export default new Command({
	name: "question",
	description: "Faça uma pergunta e o bot responderá com `SIM` ou `NÃO`",
	options: [{ name: "pergunta", description: "A pergunta", type: "STRING", required: true }],
	run: async ({ interaction }) => {
		const choice = Math.random() > 0.5 ? "SIM" : "NÃO";
		let embed = new MessageEmbed();
		embed.setTitle(`Hora da Pergunta!`);
		embed.setDescription(`Pergunta: ${interaction.options.getString("pergunta")}\nResposta: ${choice}`);
		interaction.followUp({ embeds: [embed] });
	},
});
