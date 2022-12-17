import Discord, { ButtonStyle, Colors } from "discord.js";
import { Client } from "genius-lyrics";

import { Manager } from "erela.js";
import Spotify from "erela.js-spotify";

import logger from "./logger";
import config from "../config.json";

export default (bot: any) => {
    bot.lyricsClient = new Client(process.env.GENIUS);
    bot.music = new Manager({
        nodes: [{
          host: "lavalink.joshsevero.dev",
          port: 80,
          password: "oxygen",
          secure: false
        }, {
          host: "purr.aikomechawaii.live",
          port: 10415,
          password: "AnythingAsPassword",
          secure: false
        }],
        autoPlay: true,
        plugins: [
            new Spotify({
                clientID: process.env.SPOTIFYID,
                clientSecret: process.env.SPOTIFYSECRET
            })
        ],
        send(id, payload) {
            const guild = bot.guilds.cache.get(id);
            guild && guild.shard.send(payload);
        }
    })

    bot.on("raw", (event: any) => bot.music.updateVoiceState(event));
    bot.music
        .on("nodeConnect", (node: any) => logger("Music System", `Node ${node.options.identifier} connected`, "green"))
        .on("nodeError", (node: any, error: any) => logger("Music System", `Node ${node.options.identifier} had an error: ${error.message}`, "red"))
        .on("trackStuck", async (player: any, track: any) => {
            const guild = bot.guilds.cache.get(player.guild);
            const channel = guild.channels.cache.get(player.textChannel) || await guild.channels.fetch(player.textChannel).catch((): any => { });

            channel && await channel.send({
                embeds: [{
                    description: `${config.emojis.alert} | **Error Occured**\nAn error occurred while playing the song.`,
                    color: Colors.Red,
                    timestamp: new Date()
                }]
            });
        }).on("queueEnd", async (player: any) => {
            const guild = bot.guilds.cache.get(player.guild);
            const channel = guild.channels.cache.get(player.textChannel) || await guild.channels.fetch(player.textChannel);

            await channel.send({
                embeds: [{
                    description: `${config.emojis.alert} | **Queue Ended**\nAdd more songs to keep playing more music.`,
                    color: Colors.Red,
                    timestamp: new Date()
                }]
            });
            player.destroy();
        }).on("playerMove", async (player: any, oldChannel: any, newChannel: any) => {
            if (!newChannel) return await player.destroy();
            player.setVoiceChannel(newChannel);
        })

    bot.music.formatDuration = (duration: number) => {
        let seconds: any = Math.round((duration / 1000) % 60);
        let minutes: any = Math.round((duration / (1000 * 60)) % 60);
        let hours: any = Math.round(duration / (1000 * 60 * 60) % 24);

        hours = (hours < 10) ? `0${hours}` : hours;
        minutes = (minutes < 10) ? `0${minutes}` : minutes;
        seconds = (seconds < 10) ? `0${seconds}` : seconds;

        return duration < (3600 * 1000) ? `${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`;
    };

    bot.music.handleMusic = async (playerData: any, track: any, mEmbed: Discord.EmbedBuilder, options: any) => {
        const TogglePlayingButton = new Discord.ButtonBuilder().setEmoji(config.emojis.pause).setCustomId("TP")
            .setStyle(ButtonStyle.Danger);
        const LoopButton = new Discord.ButtonBuilder().setEmoji(config.emojis.loop).setCustomId("loop")
            .setStyle(ButtonStyle.Secondary);
        const LyricsButton = new Discord.ButtonBuilder().setEmoji(config.emojis.queue).setCustomId("lyrics")
            .setStyle(ButtonStyle.Secondary);
        const StopButton = new Discord.ButtonBuilder().setEmoji(config.emojis.music_stop).setCustomId("stop")
            .setStyle(ButtonStyle.Danger);

        const buttons = [];
        if (options?.includePause === true) buttons.push(TogglePlayingButton);
        if (options?.includeStop === true) buttons.push(StopButton);
        if (options?.includeLoop === true) buttons.push(LoopButton);

        let lyrics: any;
        try { lyrics = await (await bot.lyricsClient.songs.search(track.title))[0].lyrics(); } catch (e) { lyrics = null; }
        if (lyrics && options?.includeLyrics === true) buttons.push(LyricsButton);

        const guild = bot.guilds.cache.get(playerData.guild);
        const channel = guild.channels.cache.get(playerData.textChannel) || await guild.channels.fetch(playerData.textChannel);
        const MusicMessage = await channel.send({
            embeds: [mEmbed],
            components: buttons.length > 0 ? [{
                type: 1,
                components: buttons
            }] : [],
            fetchReply: true
        }).catch((): any => { });

        if (!MusicMessage) return;

        let collector: any;
        if (options?.createCollector === true) {
            collector = MusicMessage.createMessageComponentCollector({ time: 1800 * 1000 });
            collector.on("collect", async (interaction: any) => {
                await interaction.deferReply({ ephemeral: true });

                const embed: any = {
                    author: {
                        name: interaction.user.tag,
                        icon_url: interaction.user.displayAvatarURL()
                    },
                    color: Colors.Blue,
                    timestamp: new Date()
                }

                if (interaction.customId === "loop") {
                    const playerData = bot.music.players.get(interaction?.guild?.id);
                    if (!playerData) {
                        await interaction.editT("There is no music playing.");
                        collector.stop();
                    }

                    const loopModes = [0, 1, 2];
                    const nextLoopMode = loopModes[track.queue.repeatMode + 1] || 0;
                    const loopMode = nextLoopMode === 0 ? `${config.emojis.error} Disabled` : `${config.emojis.success} ${nextLoopMode === 1 ? "\`Server Queue\`" : "\`Current Song\`"}`;

                    track.queue.setRepeatMode(nextLoopMode).catch((): any => { });

                    embed.title = `${config.emojis.music} | Looping ${loopMode}`;
                    embed.description = `Looping is now ${loopMode}.`;
                } else if (interaction.customId === "TP") {
                    const playerData = bot.music.players.get(interaction?.guild?.id);
                    if (!playerData) {
                        await interaction.editT("There is no music playing.");
                        collector.stop();
                    }

                    if (playerData?.paused === true) {
                        playerData?.pause(false);

                        embed.title = `${config.emojis.music} | Music Resumed!`;
                        embed.description = `Resumed ${playerData?.queue?.current?.title} by ${playerData?.queue?.current?.author}.`;
                        embed.color = Colors.Green;

                        TogglePlayingButton.setEmoji(config.emojis.pause).setStyle(ButtonStyle.Danger);
                    } else {
                        playerData?.pause(true);

                        embed.title = `${config.emojis.music} | Music Paused!`;
                        embed.description = `Paused ${playerData?.queue?.current?.title} by ${playerData?.queue?.current?.author}.`;
                        embed.color = Colors.Red;

                        TogglePlayingButton.setEmoji(config.emojis.arrows.right).setStyle(ButtonStyle.Success);
                    }

                    MusicMessage.editT({
                        embeds: [mEmbed],
                        components: [{
                            type: 1,
                            components: [TogglePlayingButton, StopButton, LoopButton]
                        }]
                    });
                } else if (interaction.customId === "stop") {
                    const playerData = bot.music.players.get(interaction?.guild?.id);
                    if (!playerData) {
                        await interaction.editT("There is no music playing.");
                        collector.stop();
                    }

                    playerData?.stop();

                    embed.title = `${config.emojis.error} | Music Stopped!`;
                    embed.description = `Stopped playing ${playerData?.queue?.current?.title} by ${playerData?.queue?.current?.author}.`;
                    embed.color = Colors.Red;
                } else if (interaction.customId === "lyrics") {
                    embed.title = `${config.emojis.queue} | Song Lyrics`;
                    embed.description = lyrics.length >= 4000 ? `${lyrics.slice(0, 2000)}...\nView more lyrics by running /music lyrics.` : lyrics
                    embed.color = Colors.Blue;
                }

                interaction.reply({ embeds: [embed], ephemeral: true });
            });

            collector.on("end", async (collected: any) => {
                if (MusicMessage) {
                    try {
                        MusicMessage?.edit({
                            embeds: [mEmbed],
                            components: []
                        });
                    } catch (e) { }
                }
            });
        }

        return { msg: MusicMessage, collector };
    };
};
