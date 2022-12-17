"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importStar(require("discord.js"));
const genius_lyrics_1 = require("genius-lyrics");
const erela_js_1 = require("erela.js");
const erela_js_spotify_1 = __importDefault(require("erela.js-spotify"));
const logger_1 = __importDefault(require("./logger"));
const config_json_1 = __importDefault(require("../config.json"));
exports.default = (bot) => {
    bot.lyricsClient = new genius_lyrics_1.Client(process.env.GENIUS);
    bot.music = new erela_js_1.Manager({
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
            new erela_js_spotify_1.default({
                clientID: process.env.SPOTIFYID,
                clientSecret: process.env.SPOTIFYSECRET
            })
        ],
        send(id, payload) {
            const guild = bot.guilds.cache.get(id);
            guild && guild.shard.send(payload);
        }
    });
    bot.on("raw", (event) => bot.music.updateVoiceState(event));
    bot.music
        .on("nodeConnect", (node) => (0, logger_1.default)("Music System", `Node ${node.options.identifier} connected`, "green"))
        .on("nodeError", (node, error) => (0, logger_1.default)("Music System", `Node ${node.options.identifier} had an error: ${error.message}`, "red"))
        .on("trackStuck", async (player, track) => {
        const guild = bot.guilds.cache.get(player.guild);
        const channel = guild.channels.cache.get(player.textChannel) || await guild.channels.fetch(player.textChannel).catch(() => { });
        channel && await channel.send({
            embeds: [{
                    description: `${config_json_1.default.emojis.alert} | **Error Occured**\nAn error occurred while playing the song.`,
                    color: discord_js_1.Colors.Red,
                    timestamp: new Date()
                }]
        });
    }).on("queueEnd", async (player) => {
        const guild = bot.guilds.cache.get(player.guild);
        const channel = guild.channels.cache.get(player.textChannel) || await guild.channels.fetch(player.textChannel);
        await channel.send({
            embeds: [{
                    description: `${config_json_1.default.emojis.alert} | **Queue Ended**\nAdd more songs to keep playing more music.`,
                    color: discord_js_1.Colors.Red,
                    timestamp: new Date()
                }]
        });
        player.destroy();
    }).on("playerMove", async (player, oldChannel, newChannel) => {
        if (!newChannel)
            return await player.destroy();
        player.setVoiceChannel(newChannel);
    });
    bot.music.formatDuration = (duration) => {
        let seconds = Math.round((duration / 1000) % 60);
        let minutes = Math.round((duration / (1000 * 60)) % 60);
        let hours = Math.round(duration / (1000 * 60 * 60) % 24);
        hours = (hours < 10) ? `0${hours}` : hours;
        minutes = (minutes < 10) ? `0${minutes}` : minutes;
        seconds = (seconds < 10) ? `0${seconds}` : seconds;
        return duration < (3600 * 1000) ? `${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`;
    };
    bot.music.handleMusic = async (playerData, track, mEmbed, options) => {
        const TogglePlayingButton = new discord_js_1.default.ButtonBuilder().setEmoji(config_json_1.default.emojis.pause).setCustomId("TP")
            .setStyle(discord_js_1.ButtonStyle.Danger);
        const LoopButton = new discord_js_1.default.ButtonBuilder().setEmoji(config_json_1.default.emojis.loop).setCustomId("loop")
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        const LyricsButton = new discord_js_1.default.ButtonBuilder().setEmoji(config_json_1.default.emojis.queue).setCustomId("lyrics")
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        const StopButton = new discord_js_1.default.ButtonBuilder().setEmoji(config_json_1.default.emojis.music_stop).setCustomId("stop")
            .setStyle(discord_js_1.ButtonStyle.Danger);
        const buttons = [];
        if (options?.includePause === true)
            buttons.push(TogglePlayingButton);
        if (options?.includeStop === true)
            buttons.push(StopButton);
        if (options?.includeLoop === true)
            buttons.push(LoopButton);
        let lyrics;
        try {
            lyrics = await (await bot.lyricsClient.songs.search(track.title))[0].lyrics();
        }
        catch (e) {
            lyrics = null;
        }
        if (lyrics && options?.includeLyrics === true)
            buttons.push(LyricsButton);
        const guild = bot.guilds.cache.get(playerData.guild);
        const channel = guild.channels.cache.get(playerData.textChannel) || await guild.channels.fetch(playerData.textChannel);
        const MusicMessage = await channel.send({
            embeds: [mEmbed],
            components: buttons.length > 0 ? [{
                    type: 1,
                    components: buttons
                }] : [],
            fetchReply: true
        }).catch(() => { });
        if (!MusicMessage)
            return;
        let collector;
        if (options?.createCollector === true) {
            collector = MusicMessage.createMessageComponentCollector({ time: 1800 * 1000 });
            collector.on("collect", async (interaction) => {
                await interaction.deferReply({ ephemeral: true });
                const embed = {
                    author: {
                        name: interaction.user.tag,
                        icon_url: interaction.user.displayAvatarURL()
                    },
                    color: discord_js_1.Colors.Blue,
                    timestamp: new Date()
                };
                if (interaction.customId === "loop") {
                    const playerData = bot.music.players.get(interaction?.guild?.id);
                    if (!playerData) {
                        await interaction.editT("There is no music playing.");
                        collector.stop();
                    }
                    const loopModes = [0, 1, 2];
                    const nextLoopMode = loopModes[track.queue.repeatMode + 1] || 0;
                    const loopMode = nextLoopMode === 0 ? `${config_json_1.default.emojis.error} Disabled` : `${config_json_1.default.emojis.success} ${nextLoopMode === 1 ? "\`Server Queue\`" : "\`Current Song\`"}`;
                    track.queue.setRepeatMode(nextLoopMode).catch(() => { });
                    embed.title = `${config_json_1.default.emojis.music} | Looping ${loopMode}`;
                    embed.description = `Looping is now ${loopMode}.`;
                }
                else if (interaction.customId === "TP") {
                    const playerData = bot.music.players.get(interaction?.guild?.id);
                    if (!playerData) {
                        await interaction.editT("There is no music playing.");
                        collector.stop();
                    }
                    if (playerData?.paused === true) {
                        playerData?.pause(false);
                        embed.title = `${config_json_1.default.emojis.music} | Music Resumed!`;
                        embed.description = `Resumed ${playerData?.queue?.current?.title} by ${playerData?.queue?.current?.author}.`;
                        embed.color = discord_js_1.Colors.Green;
                        TogglePlayingButton.setEmoji(config_json_1.default.emojis.pause).setStyle(discord_js_1.ButtonStyle.Danger);
                    }
                    else {
                        playerData?.pause(true);
                        embed.title = `${config_json_1.default.emojis.music} | Music Paused!`;
                        embed.description = `Paused ${playerData?.queue?.current?.title} by ${playerData?.queue?.current?.author}.`;
                        embed.color = discord_js_1.Colors.Red;
                        TogglePlayingButton.setEmoji(config_json_1.default.emojis.arrows.right).setStyle(discord_js_1.ButtonStyle.Success);
                    }
                    MusicMessage.editT({
                        embeds: [mEmbed],
                        components: [{
                                type: 1,
                                components: [TogglePlayingButton, StopButton, LoopButton]
                            }]
                    });
                }
                else if (interaction.customId === "stop") {
                    const playerData = bot.music.players.get(interaction?.guild?.id);
                    if (!playerData) {
                        await interaction.editT("There is no music playing.");
                        collector.stop();
                    }
                    playerData?.stop();
                    embed.title = `${config_json_1.default.emojis.error} | Music Stopped!`;
                    embed.description = `Stopped playing ${playerData?.queue?.current?.title} by ${playerData?.queue?.current?.author}.`;
                    embed.color = discord_js_1.Colors.Red;
                }
                else if (interaction.customId === "lyrics") {
                    embed.title = `${config_json_1.default.emojis.queue} | Song Lyrics`;
                    embed.description = lyrics.length >= 4000 ? `${lyrics.slice(0, 2000)}...\nView more lyrics by running /music lyrics.` : lyrics;
                    embed.color = discord_js_1.Colors.Blue;
                }
                interaction.reply({ embeds: [embed], ephemeral: true });
            });
            collector.on("end", async (collected) => {
                if (MusicMessage) {
                    try {
                        MusicMessage?.edit({
                            embeds: [mEmbed],
                            components: []
                        });
                    }
                    catch (e) { }
                }
            });
        }
        return { msg: MusicMessage, collector };
    };
};
//# sourceMappingURL=music.js.map