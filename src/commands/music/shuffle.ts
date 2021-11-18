import { Command } from "../../structures/Command";
import { download, getNextMusic, play } from "./play";
import { readFileSync, writeFileSync } from "fs";

export default new Command({
	name: "shuffle",
	description: "Embaralha a playlist",
	run: async ({ interaction }) => {
		const { queue } = JSON.parse(readFileSync(`${__dirname}/queue.json`).toString());
		let shuffledQueue: Array<any> = queue.sort(() => Math.random() - 0.5);
		const index = shuffledQueue.findIndex(({ playing }) => playing);
		// remove index from shuffleQued
		shuffledQueue[index] = { ...shuffledQueue[index], playing: false };
		writeFileSync(`${__dirname}/queue.json`, JSON.stringify({ queue: shuffledQueue }));
		play(await download(getNextMusic(true)));
		interaction.followUp("Embaralhando a playlist");
	},
});
