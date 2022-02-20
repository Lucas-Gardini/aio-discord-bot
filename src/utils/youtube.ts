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
		const video = await this.search(videoId);
		try {
			return await this.youtube.getDetails(video.videos[0].id);
		} catch (error) {
			return error;
		}
	}

	async getPlaylist(playlistId: string): Promise<Result> {
		return await ytpl(playlistId);
	}

	download({ videoId, title, type, format }): Promise<string> {
		title = slugify(title, { strict: true });
		return new Promise((resolve, reject) => {
			try {
				const stream = this.youtube.download(videoId, {
					type: "audio",
					// format: "mp3",
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

				stream.on("progress", (info) => {
					process.stdout.clearLine(1);
					process.stdout.cursorTo(0);
					process.stdout.write(
						`[YOUUTBE MANAGER] Downloaded ${info.percentage}% (${info.downloaded_size}MB) of ${info.size}MB`
					);
				});

				stream.on("end", () => {
					console.log(chalk.red("\n[YOUTUBE MANAGER] ") + chalk.underline("Done!"));
					resolve(title);
				});

				stream.on("error", (err) => {
					console.log(err);
					resolve("false");
				});
			} catch (error) {
				resolve(error);
			}
		});
	}

	delete(title: string) {
		if (title.length <= 0) return;
		title = slugify(title, { strict: true });
		unlinkSync(`./src/resources/${title}.mp3`);
	}
}
