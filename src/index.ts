require("dotenv").config();
import { ExtendedClient } from "./structures/Client";
import { existsSync, writeFileSync, readdirSync, unlinkSync } from "fs";

export const client = new ExtendedClient();

writeFileSync(`${__dirname}/commands/music/queue.json`, JSON.stringify({ queue: [] }));
readdirSync(`${__dirname}/resources`).forEach((file) => {
	unlinkSync(`${__dirname}/resources/${file}`);
});

client.start();
