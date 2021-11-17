import { joinVoiceChannel, VoiceConnection, AudioPlayerStatus } from "@discordjs/voice";
import { Command } from "../../structures/Command";
import { YoutubeManager } from "../../utils/youtube";
import Player, { newAudioResource } from "../../utils/audioPlayer";
import ExtendedInteraction from "../../typings/Command";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { Result } from "ytpl";

const youtubeManager = new YoutubeManager();
let connection: VoiceConnection = null;
let video: any = null;

function connect(interaction: ExtendedInteraction) {
	if (!connection) {
		connection = joinVoiceChannel({
			channelId: interaction.member.voice.channelId,
			guildId: interaction.guild.id,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});
	}
}

export async function download(video) {
	try {
		return await youtubeManager.download({
			videoId: video.id,
			title: video.title,
			format: "mp3",
			type: "audio",
		});
	} catch (error) {
		return null;
	}
}

export async function play(music_path: string) {
	Player.play(newAudioResource(`${__dirname}/../../resources/${music_path}.mp3`));

	Player.on(AudioPlayerStatus.Idle, async () => {
		play(await download(getNextMusic(true)));
	});
}

export function getNextMusic(cameFromHandler: boolean): string {
	const { queue } = JSON.parse(readFileSync(`${__dirname}/queue.json`).toString());
	// loop array of objects and find index of playing: true
	const index = queue.findIndex(({ playing }) => playing);
	if (!cameFromHandler) {
		if (index > -1) return;
	}

	if (index === -1) {
		queue[0].playing = true;
		writeFileSync(`${__dirname}/queue.json`, JSON.stringify({ queue }));
		return queue[0];
	}

	if (cameFromHandler) {
		if (index !== queue.length - 1 && index > -1) {
			queue[index].playing = false;
			queue[index + 1].playing = true;
			writeFileSync(`${__dirname}/queue.json`, JSON.stringify({ queue }));
			return queue[index + 1];
		}
	}
	// if index is the last index, stop the music
	Player.stop();
}

function getCurrentMusic() {
	const { queue } = JSON.parse(readFileSync(`${__dirname}/queue.json`).toString());
	// loop array of objects and find index of playing: true
	const index = queue.findIndex(({ playing }) => playing);
	if (index > -1) return queue[index];
	return null;
}

function getPreviousMusic() {
	const { queue } = JSON.parse(readFileSync(`${__dirname}/queue.json`).toString());
	// loop array of objects and find index of playing: true
	const index = queue.findIndex(({ playing }) => playing);
	if (index > 0) return queue[index];
	return null;
}

function thereIsAMusicPlaying() {
	const { queue } = JSON.parse(readFileSync(`${__dirname}/queue.json`).toString());
	// loop array of objects and find index of playing: true
	const index = queue.findIndex(({ playing }) => playing);
	if (index > -1) return true;
	return false;
}

export default new Command({
	name: "play",
	description: "Toca uma música, olha que incrível. use: /play url ou /play pesquisa",
	options: [
		{ name: "query", description: "Pesquisa do Youtube (link ou frase)", type: "STRING", required: true },
	],
	run: async ({ interaction }) => {
		const query = interaction.options.getString("query");

		let isPlaylist = false;
		let playlist: Result;

		if (query.includes("watch?v=")) {
			isPlaylist = false;
			video = await youtubeManager.getDetails(query.split("watch?v=")[1]);
			video.id = query.split("watch?v=")[1];
		} else if (query.includes("playlist?list=")) {
			isPlaylist = true;
			playlist = await youtubeManager.getPlaylist(query.split("playlist?list=")[1]);
		} else {
			isPlaylist = false;
			video = (await youtubeManager.search(query)).videos[0];
		}
		!isPlaylist && interaction.followUp(`Adicionado a fila: ${video.title}`);

		if (isPlaylist) {
			const { queue } = JSON.parse(readFileSync(`${__dirname}/queue.json`).toString());
			for (video of playlist.items) {
				queue.push({
					id: video.id,
					title: video.title,
					playing: false,
				});
			}
			writeFileSync(`${__dirname}/queue.json`, JSON.stringify({ queue }));
			interaction.followUp(`Adicionado a playlist ${playlist.title} a fila`);
		} else {
			const { queue } = JSON.parse(readFileSync(`${__dirname}/queue.json`).toString());
			queue.push({ title: video.title, id: video.id, playing: false });
			writeFileSync(`${__dirname}/queue.json`, JSON.stringify({ queue }));
		}

		if (!connection) {
			connect(interaction);
		}

		if (thereIsAMusicPlaying()) return;
		await play(await download(getNextMusic(false)));

		connection.subscribe(Player);
	},
});
