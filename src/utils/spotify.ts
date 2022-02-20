import chalk from "chalk";
import spotify from "spotify-to-yt";

export class SpotifyManager {
	constructor() {
		setTimeout(() => {
			console.log(chalk.greenBright("[SPOTIFY MANAGER]", "Started"));
		}, 1000);
	}

	async convertSong(song: string): Promise<string> {
		return await spotify.trackGet(song);
	}

	async convertPlaylist(playlist: string): Promise<any[]> {
		return await spotify.playListGet(playlist);
	}
}
