import { joinVoiceChannel, VoiceConnection, AudioPlayerStatus } from "@discordjs/voice";
import { MessageEmbed } from "discord.js";
import { Command } from "../../structures/Command";
import { YoutubeManager } from "../../utils/youtube";
import { SpotifyManager } from "../../utils/spotify";
import Player, { newAudioResource } from "../../utils/audioPlayer";
import ExtendedInteraction from "../../typings/Command";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { Result } from "ytpl";

const youtubeManager = new YoutubeManager();
const spotifyManager = new SpotifyManager();
let connection: VoiceConnection = null;
let video: any = null;

Player.on(AudioPlayerStatus.Idle, async () => {
	play(await download(getNextMusic(true)));
});

function connect(interaction: ExtendedInteraction) {
	if (!connection) {
		connection = joinVoiceChannel({
			channelId: interaction.member.voice.channelId,
			guildId: interaction.guild.id,
			adapterCreator: interaction.guild.voiceAdapterCreator as any,
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
}

export function getNextMusic(cameFromHandler: boolean): string {
	try {
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
	} catch (error) {
		Player.stop();
	}
}

export function stop() {
	Player.stop();
}

function getCurrentMusic() {
	const { queue } = JSON.parse(readFileSync(`${__dirname}/queue.json`).toString());
	// loop array of objects and find index of playing: true
	const index = queue.findIndex(({ playing }) => playing);
	if (index > -1) return queue[index];
	return null;
}

export function getPreviousMusic() {
	const { queue } = JSON.parse(readFileSync(`${__dirname}/queue.json`).toString());
	// loop array of objects and find index of playing: true
	const index = queue.findIndex(({ playing }) => playing);
	if (index > 0) return queue[index - 1];
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
		try {
			const query = interaction.options.getString("query");
			console.log(`Usuário ${interaction.user.username} pesquisou por "${query}"`);

			let isPlaylist = false;
			let playlist: Result = {
				items: [],
				id: "",
				url: "",
				title: "",
				estimatedItemCount: 0,
				views: 0,
				thumbnails: [],
				bestThumbnail: undefined,
				lastUpdated: "",
				description: "",
				visibility: "unlisted",
				author: {
					name: "",
					url: "",
					avatars: [],
					bestAvatar: undefined,
					channelID: "",
				},
				continuation: undefined,
			};

			if (query.includes("watch?v=")) {
				isPlaylist = false;
				video = (await youtubeManager.search(query)).videos[0];
				video.id = query.split("watch?v=")[1];
			} else if (query.includes("playlist?list=")) {
				isPlaylist = true;
				playlist = await youtubeManager.getPlaylist(query.split("playlist?list=")[1]);
			} else if (query.includes("track")) {
				isPlaylist = false;
				const fromYoutube: any = await spotifyManager.convertSong(query);
				video = (await youtubeManager.search(fromYoutube.url)).videos[0];
				video.id = fromYoutube.url.split("watch?v=")[1];
			} else if (query.includes("playlist")) {
				isPlaylist = true;
				const fromYoutube: any = await spotifyManager.convertPlaylist(query);
				playlist.items = fromYoutube.songs;
			} else {
				isPlaylist = false;
				video = (await youtubeManager.search(query)).videos[0];
			}
			if (!isPlaylist) {
				console.log(`\nVídeo encontrado: ${video.title}\n`);
				try {
					const embed = new MessageEmbed();
					video.metadata.thumbnails
						? embed.setThumbnail(video.metadata.thumbnails[0].url)
						: embed.setThumbnail(video.thumbnail.url);
					embed.setTitle(video.title);
					embed.setAuthor({ name: "Adicionado a fila:" });
					video.metadata.thumbnails &&
						embed.setDescription(
							`${video.description}\n\nDuração: ${video.metadata.duration.simple_text}`
						);
					video.metadata.thumbnails && embed.setFooter({ text: video.author });
					interaction.followUp({ embeds: [embed] });
				} catch (error) {
					interaction.followUp(`${error}`);
				}
			}

			if (isPlaylist) {
				const { queue } = JSON.parse(readFileSync(`${__dirname}/queue.json`).toString());
				for (video of playlist.items) {
					queue.push({
						id: video.split("watch?v=")[1],
						title: String(playlist.items.indexOf(video)),
						playing: false,
					});
				}
				writeFileSync(`${__dirname}/queue.json`, JSON.stringify({ queue }));

				if (playlist.id === "") {
					const embed = new MessageEmbed();
					embed.setTitle("Playlist convertida do spotify");
					embed.setAuthor({ name: "Adicionado a fila:" });
					embed.setFooter({ text: query });
					interaction.followUp({ embeds: [embed] });
				} else {
					const embed = new MessageEmbed();
					embed.setThumbnail(playlist.thumbnails[0].url);
					embed.setTitle(playlist.title);
					embed.setAuthor({ name: "Adicionado a fila:" });
					embed.setDescription(`${playlist.description}`);
					embed.setFooter({ text: `${playlist.author.name}` });
					interaction.followUp({ embeds: [embed] });
				}
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
		} catch (error) {
			console.log(error);
			try {
				interaction.followUp(error);
			} catch (error) {}
		}
	},
});
