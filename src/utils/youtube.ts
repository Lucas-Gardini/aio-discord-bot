import Innertube from "youtubei.js";
import ytpl, { Result } from "ytpl";
import chalk from "chalk";
import { existsSync, mkdirSync, createWriteStream, unlinkSync } from "fs";
import slugify from "slugify";
slugify.extend({
	'"': "",
	"/": "",
	"\\": "",
	" ": "-",
});

export class YoutubeManager {
	youtube: typeof Innertube;
	constructor() {
		setTimeout(() => {
			console.log(chalk.yellow("[YOUTUBE MANAGER]", "Started"));
		}, 1000);
		this.instantiateInnertube();
	}

	async instantiateInnertube() {
		this.youtube = await new Innertube();
	}

	async search(query: string) {
		return await this.youtube.search(query);
	}

	async getDetails(videoId: string) {
		return await this.youtube.getDetails(videoId);
	}

	async getPlaylist(playlistId: string): Promise<Result> {
		return await ytpl(playlistId);
	}

	download({ videoId, title, type, format }): Promise<string> {
		title = slugify(title, { strict: true });
		return new Promise((resolve, reject) => {
			const stream = this.youtube.download(videoId, {
				type: type,
			});

			// check if ./src/resources folder exists, if not, create it
			if (!existsSync("./src/resources")) {
				mkdirSync("./src/resources");
			}

			stream.pipe(createWriteStream(`./src/resources/${title}.${format}`));

			stream.on("start", () => {
				console.log(
					chalk.red("\n[YOUTUBE MANAGER]") + ` Started downloading ${chalk.underline(title)}`
				);
			});

			stream.on("end", () => {
				console.log(chalk.red("\n[YOUTUBE MANAGER] ") + chalk.underline("Done!"));
				resolve(title);
			});

			stream.on("error", (err) => reject(err));
		});
	}

	delete(title: string) {
		if (title.length <= 0) return;
		title = slugify(title, { strict: true });
		unlinkSync(`./src/resources/${title}.mp3`);
	}
}
