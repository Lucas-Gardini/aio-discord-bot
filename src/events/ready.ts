import chalk from "chalk";
import { Event } from "../structures/Event";

export default new Event("ready", () => {
	console.log(chalk.green("Bot is Ready!"));
});
