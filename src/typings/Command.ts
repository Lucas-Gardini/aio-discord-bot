import {
	CommandInteraction,
	CommandInteractionOptionResolver,
	ChatInputApplicationCommandData,
	PermissionResolvable,
	GuildMember,
} from "discord.js";
import { ExtendedClient } from "../structures/Client";

/**
 * {
 * 	name: "command name",
 * 	description: "command description",
 *  run: async({interaction}) => {}
 * }
 */
export default interface ExtendedInteraction extends CommandInteraction {
	member: GuildMember;
}

interface RunOptions {
	client: ExtendedClient;
	interaction: ExtendedInteraction;
	args: CommandInteractionOptionResolver;
}

type RunFunction = (options: RunOptions) => any;

export type CommandType = {
	userPermissions?: PermissionResolvable[];
	cooldown?: number;
	run: RunFunction;
} & ChatInputApplicationCommandData;
