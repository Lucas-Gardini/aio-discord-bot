import { Command } from "../../structures/Command";

export default new Command({
	name: "random",
	description: "Escolhe um item aleatório (Separe por vírgulas)",
	options: [{ name: "options", description: "Separe por vírgulas", type: "STRING", required: true }],
	run: async ({ interaction }) => {
		try {
			if (!interaction.options.getString("options").includes(",")) {
				return interaction.followUp("Separe por vírgulas animal!");
			}
			const options = interaction.options.getString("options").split(",");
			interaction.followUp(
				`Entre \`${options}\` eu escolho \´${options[Math.floor(Math.random() * options.length)]}\``
			);
		} catch (error) {
			interaction.followUp(error);
		}
	},
});
