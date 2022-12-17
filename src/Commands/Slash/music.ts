import Discord, { Colors } from "discord.js";

import cmd from "../../Structures/command";

import config from "../../config.json";

const Emotes = [config.emojis.numbers.one, config.emojis.numbers.two, config.emojis.numbers.three, config.emojis.numbers.four, config.emojis.numbers.five, config.emojis.numbers.six, config.emojis.numbers.seven, config.emojis.numbers.eight, config.emojis.numbers.nine, "🔟"];

async function execute(bot: any, message: any, args: string[], command: any, data: any) {
	if (!message?.member?.voice?.channel) return message.followUp(`${config.emojis.alert} | You must be in a voice channel to use this command.`);

	/* -------------------------------------------------- VARIABLES --------------------------------------------------*/
	let playerData = bot.music.players.get(message?.guild?.id);
	let track = playerData?.queue?.current;
	let lyrics: any;
	try { lyrics = await (await bot.lyricsClient.songs.search(track.title))[0].lyrics(); } catch (e) { lyrics = null; }

	const TogglePlayingButton = { type: 2, emoji: config.emojis.pause, customId: "TP", style: 4 };
	const LoopButton = { type: 2, emoji: config.emojis.loop, customId: "loop", style: 2 };
	const LyricsButton = { type: 2, emoji: config.emojis.queue, customId: "lyrics", style: 2 };
	const StopButton = { type: 2, emoji: config.emojis.music_stop, customId: "stop", style: 4 };
	const playButton = { type: 2, emoji: config.emojis.plus, customId: "play", style: 2 };

	let mEmbed = {
		title: `${config.emojis.music} | ${track ? `Currently Playing ${track?.title}` : "No Songs Playing"}`,
		url: track?.uri,
		thumbnail: { url: track?.thumbnail },
		fields: [{
			name: `${config.emojis.player} Uploader`,
			value: `\`\`\`${track?.author || "Unknown"}\`\`\``,
			inline: true
		}, {
			name: `${config.emojis.clock} Duration`,
			value: `\`\`\`${track?.duration || "0:00"}\`\`\``,
			inline: true
		}, {
			name: `${config.emojis.clock} Song Progress`,
			value: `\`\`\`${bot.functions.splitBar(0, track?.duration || 40, 45)}\`\`\``,
			inline: false
		}, {
			name: `${config.emojis.music} Songs [${playerData?.queue?.totalSize || 0}]`,
			value: `${playerData?.queue ? `\`${playerData?.queue?.map((song: any, id: number) => `${Emotes[id] || (id + 1)} **${song.title}** - ${bot.music.formatDuration(song.duration)}`).slice(0, 10)}\`` : `> ${config.emojis.alert} No songs are in queue. Tap the plus button below to add a song!`}`,
			inline: false
		}, {
			name: `${config.emojis.volume} Volume`,
			value: `\`${playerData?.volume || 100}%\``,
			inline: true
		}, {
			name: `${config.emojis.loop} Loop`,
			value: `${playerData?.trackRepeat ? `${config.emojis.success} \`Enabled: Song\`` : (playerData?.queueRepeat ? `${config.emojis.success} \`Enabled: Queue\`` : `${config.emojis.error} \`Disabled\``)}`,
			inline: true
		}],
		color: Colors.Blue,
		timestamp: new Date()
	};
	let moreOptions = {
		type: 3,
		customId: "more_options",
		placeholder: "Click to view more options.",
		options: [{
			label: "Skip",
			description: "Tap to skip the current song.",
			value: "skip",
			emoji: config.emojis.slash
		}, {
			label: "Forward",
			description: "Tap to forward the song by 10 seconds.",
			value: "forward",
			emoji: config.emojis.slash
		}, {
			label: "Rewind",
			description: "Tap to rewind the song by 10 seconds.",
			value: "rewind",
			emoji: config.emojis.slash
		}]
	};

	let buttons: any = [];
	track ? buttons.push({ type: 1, components: [playButton, TogglePlayingButton, StopButton, LoopButton] }) : buttons.push({ type: 1, components: [playButton] });
	track && lyrics ? buttons[0].components.push(LyricsButton) : null;
	track && buttons.push({ type: 1, components: [moreOptions] });

	/* -------------------------------------------------- SEND MESSAGE --------------------------------------------------*/
	let mainScreen = true;
	const msg = await message.followUp({
		embeds: [mEmbed],
		components: buttons,
		fetchfollowUp: true
	});

	/* -------------------------------------------------- FUNCTIONS --------------------------------------------------*/
	async function refreshMenu() {
		await bot.wait(3000);

		buttons = [];

		playerData = bot.music.players.get(message?.guild?.id);
		track = playerData?.queue?.current;
		track ? buttons.push({ type: 1, components: [playButton, TogglePlayingButton, StopButton, LoopButton] }) : buttons.push({ type: 1, components: [playButton] });
		track && lyrics ? buttons[0].components.push(LyricsButton) : null;
		track && buttons.push({ type: 1, components: [moreOptions] });

		mEmbed = {
			title: `${config.emojis.music} | ${track ? `Currently Playing ${track?.title}` : "No Songs Playing"}`,
			url: track?.uri,
			thumbnail: { url: track?.thumbnail },
			fields: [{
				name: `${config.emojis.player} Uploader`,
				value: `\`\`\`${track?.author || "Unknown"}\`\`\``,
				inline: true
			}, {
				name: `${config.emojis.clock} Duration`,
				value: `\`\`\`00:00/${bot.music.formatDuration(track?.duration)}\`\`\``,
				inline: true
			}, {
				name: `${config.emojis.clock} Song Progress`,
				value: `\`\`\`${bot.functions.splitBar(0, track?.duration || 40, 45)}\`\`\``,
				inline: false
			}, {
				name: `${config.emojis.music} Songs [${playerData?.queue?.totalSize || 0}]`,
				value: `${playerData?.queue ? `${playerData?.queue?.current ? `> ${Emotes[0]} ${playerData?.queue?.current?.title} - ${bot.music.formatDuration(playerData?.queue?.current?.duration)}\n` : ""}${playerData?.queue?.map((song: any, id: number) => `> ${Emotes[id] || (id + 1)} ${song.title.length >= 30 ? song.title.slice(0, 30) + "..." : song.title} - ${bot.music.formatDuration(song.duration)}`).slice(0, 10).join("\n").slice(0, 1024)}` : `> ${config.emojis.alert} No songs are in queue. Tap the plus button below to add a song!`}`,
				inline: false
			}, {
				name: `${config.emojis.volume} Volume`,
				value: `\`${playerData?.volume || 100}%\``,
				inline: true
			}, {
				name: `${config.emojis.loop} Loop`,
				value: `${playerData?.trackRepeat ? `${config.emojis.success} \`Enabled: Song\`` : (playerData?.queueRepeat ? `${config.emojis.success} \`Enabled: Queue\`` : `${config.emojis.error} \`Disabled\``)}`,
				inline: true
			}],
			color: Colors.Blue,
			timestamp: new Date()
		}

		await msg.edit({
			embeds: [mEmbed],
			components: buttons,
			fetchfollowUp: true
		});

		if (mainScreen === true) {
			const updateMusic: any = setInterval(async () => {
				if (mainScreen === false) return clearInterval(updateMusic);

				playerData = bot.music.players.get(message?.guild?.id);
				if (playerData?.queue?.playing === false && playerData?.queue?.paused === false) return clearInterval(updateMusic);
				if (playerData?.queue?.paused === true) return;

				mEmbed.fields = [{
					name: `${config.emojis.player} Uploader`,
					value: `\`\`\`${track?.author}\`\`\``,
					inline: true
				}, {
					name: `${config.emojis.clock} Duration`,
					value: `\`\`\`${bot.music.formatDuration(playerData?.position)}/${bot.music.formatDuration(track?.duration)}\`\`\``,
					inline: true
				}, {
					name: `${config.emojis.clock} Song Progress`,
					value: `\`\`\`${bot.functions.splitBar(playerData?.position, track?.duration || 50, 45)}\`\`\``,
					inline: false
				}, {
					name: `${config.emojis.music} Songs [${playerData?.queue?.totalSize || 0}]`,
					value: `${playerData?.queue ? `${playerData?.queue?.current ? `> ${Emotes[0]} ${playerData?.queue?.current?.title} - ${bot.music.formatDuration(playerData?.queue?.current?.duration)}\n` : ""}${playerData?.queue?.map((song: any, id: number) => `> ${Emotes[id] || (id + 1)} ${song.title.length >= 30 ? song.title.slice(0, 30) + "..." : song.title} - ${bot.music.formatDuration(song.duration)}`).slice(0, 10).join("\n").slice(0, 1024)}` : `> ${config.emojis.alert} No songs are in queue. Tap the plus button below to add a song!`}`,
					inline: false
				}, {
					name: `${config.emojis.volume} Volume`,
					value: `\`${playerData?.volume || 100}%\``,
					inline: true
				}, {
					name: `${config.emojis.loop} Loop`,
					value: `${playerData?.trackRepeat ? `${config.emojis.success} \`Enabled: Song\`` : playerData?.queueRepeat ? `${config.emojis.success} \`Enabled: Queue\`` : `${config.emojis.error} \`Disabled\``}`,
					inline: true
				}];

				try { await msg?.edit({ embeds: [mEmbed] }); } catch (e) { clearInterval(updateMusic); }
			}, 7.5 * 1000);
		}
	}

	/* -------------------------------------------------- COLLECT INPUT --------------------------------------------------*/
	const collector: any = msg.createMessageComponentCollector({ time: 1800 * 1000 });
	collector.on("collect", async (interaction: any) => {
		interaction.customId !== "play" && await interaction.deferUpdate().catch(() => { });

		playerData = bot.music.players.get(message.guild.id);
		switch (interaction.customId) {
			case "play": {
				interaction?.showModal({
					title: `Add Song`,
					custom_id: 'add_song',
					components: [{
						type: 1,
						components: [{
							type: 4,
							custom_id: 'song_title',
							label: "Song Title/URL",
							style: 2,
							min_length: 3,
							max_length: 2000,
							value: "",
							required: true
						}]
					}]
				});

				const modal = await interaction?.awaitModalSubmit({
					filter: (inter: any) => inter.customId === "add_song" && inter.user.id === interaction.user.id,
					time: 300 * 1000
				}).catch(() => { });

				if (!modal) return console.error("[Music System]: Model is null. Debug: ", modal);
				modal.deferUpdate().catch(() => { });

				const query = modal.fields.getTextInputValue('song_title')
				await msg.edit({
					embeds: [{
						author: { name: interaction.user?.username, iconURL: interaction.user?.displayAvatarURL() },
						title: `${config.emojis.search} Searching for **${query}**...`,
						color: Colors.Blue
					}]
				});

				let spotify: boolean = query?.includes("spotify:") || query?.includes("open.spotify.com");

				const search = await bot.music.search({ query, requester: message.user });
				const tracks = spotify == true ? search?.tracks[0] : (search?.tracks[0] ? search?.tracks[0] : search?.tracks);
				if (!tracks) return await message.followUp(`${config.emojis.alert} | No results found for that query.`);

				if (!message?.member?.voice?.channel) return await message.followUp(`${config.emojis.alert} | Please join a voice channel.`)
				const player = bot.music.create({
					guild: message.guild.id,
					voiceChannel: message.member.voice.channel.id,
					textChannel: message.channel.id,
					selfDeafen: true
				});
				player.connect();

				player.queue.add(tracks);
				if (!player.playing && !player.paused && !player.queue.length) player.play();

				mainScreen = true;
				refreshMenu();
				break;
			} case "stop": {
				if (playerData && playerData.queue) playerData?.destroy();
				else if (message?.guild?.me?.voice?.channel) message.guild.me.voice.disconnect().catch(() => { });

				await interaction.followUp({
					embeds: [{
						author: { name: interaction.user?.username, iconURL: interaction.user?.displayAvatarURL() },
						title: `${config.emojis.error} | Music Stopped!`,
						description: `Stopped playing ${playerData?.queue?.current?.title} by ${playerData?.queue?.current?.author}.`,
						color: Colors.Red
					}]
				});
				break;
			} case "lyrics": {
				await interaction.followUp({
					embeds: [{
						author: { name: interaction.user?.username, iconURL: interaction.user?.displayAvatarURL() },
						title: `${config.emojis.queue} | Song Lyrics`,
						description: lyrics.length >= 4000 ? `${lyrics.slice(0, 2000)}...\nView more lyrics by running /music lyrics.` : lyrics,
						color: Colors.Green
					}],
					ephemeral: true
				});
				break;
			} case "TP": {
				if (playerData?.paused === true) {
					playerData?.pause(false);

					TogglePlayingButton.emoji = config.emojis.pause;
					TogglePlayingButton.style = 4;
				} else {
					playerData?.pause(true);

					TogglePlayingButton.emoji = config.emojis.arrows.right
					TogglePlayingButton.style = 3;
				}

				msg.edit({
					embeds: [mEmbed],
					components: [{
						type: 1,
						components: [playButton, TogglePlayingButton, StopButton, LoopButton]
					}]
				});
				break;
			} case "loop": {
				const playerData = bot.music.players.get(interaction?.guild?.id);
				if (!playerData) {
					await interaction.editT("There is no music playing.");
					collector.stop();
				}

				if (playerData?.trackRepeat) {
					playerData.setTrackRepeat(false)
					playerData.setQueueRepeat(true)
				} else if (playerData?.queueRepeat) {
					playerData.setTrackRepeat(false)
					playerData.setQueueRepeat(false)
				} else {
					playerData.setTrackRepeat(true)
				}

				refreshMenu();
				break;
			} case "more_options": {
				if (!interaction?.values[0]) return;
				if (interaction.values[0].toLowerCase() === "skip") { playerData.stop(); }
				else if (interaction.values[0].toLowerCase() === "forward") {
					let forward = playerData.queue.currentTime + 10;
					if (forward < 0) forward = 0;
					if (forward >= playerData.queue.songs[0].duration) forward = playerData.queue.songs[0].duration - 1;
					await playerData.queue.seek(forward);
				} else if (interaction.values[0].toLowerCase() === "rewind") {
					let rewind = playerData.queue.currentTime - 10;
					if (rewind < 0) rewind = 0;
					if (rewind >= playerData.queue.songs[0].duration - playerData.queue.currentTime) rewind = 0;

					await playerData.queue.seek(rewind);
				}
			}
		}
	});

	collector.on("end", async (collected: any) => msg?.edit({ embeds: [mEmbed], components: [] }));
}

export default new cmd(execute, {
	description: "Play music in your Discord server.",
	dirname: __dirname,
	aliases: [],
	usage: "",
	slash: true
});
