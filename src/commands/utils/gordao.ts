import { Command } from "../../structures/Command";

export default new Command({
	name: "gordao",
	description: "Menciona o gordão. ~meio óbvio não?~",
	run: async ({ interaction }) => {
		interaction.followUp("🥝🥑🥔🥕🥒🥜🥚🥙🥓🥞🥖🥐<@888632777522700328>🥝🥑🥔🥕🥒🥜🥚🥙🥓🥞🥖🥐");
	},
});
