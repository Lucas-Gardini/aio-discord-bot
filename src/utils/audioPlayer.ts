import {
	createAudioPlayer,
	createAudioResource,
	AudioResource,
	NoSubscriberBehavior,
} from "@discordjs/voice";

const player = createAudioPlayer({
	behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
});

export function newAudioResource(file_url: string): AudioResource {
	return createAudioResource(file_url);
}

export default player;
