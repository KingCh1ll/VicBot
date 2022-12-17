"use strict";
var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: function() {
      return m[k];
    } };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar = exports && exports.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod)
      if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
        __createBinding(result, mod, k);
  }
  __setModuleDefault(result, mod);
  return result;
};
var __importDefault = exports && exports.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
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
  bot.music.on("nodeConnect", (node) => (0, logger_1.default)("Music System", `Node ${node.options.identifier} connected`, "green")).on("nodeError", (node, error) => (0, logger_1.default)("Music System", `Node ${node.options.identifier} had an error: ${error.message}`, "red")).on("trackStuck", async (player, track) => {
    const guild = bot.guilds.cache.get(player.guild);
    const channel = guild.channels.cache.get(player.textChannel) || await guild.channels.fetch(player.textChannel).catch(() => {
    });
    channel && await channel.send({
      embeds: [{
        description: `${config_json_1.default.emojis.alert} | **Error Occured**
An error occurred while playing the song.`,
        color: discord_js_1.Colors.Red,
        timestamp: new Date()
      }]
    });
  }).on("queueEnd", async (player) => {
    const guild = bot.guilds.cache.get(player.guild);
    const channel = guild.channels.cache.get(player.textChannel) || await guild.channels.fetch(player.textChannel);
    await channel.send({
      embeds: [{
        description: `${config_json_1.default.emojis.alert} | **Queue Ended**
Add more songs to keep playing more music.`,
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
    let seconds = Math.round(duration / 1e3 % 60);
    let minutes = Math.round(duration / (1e3 * 60) % 60);
    let hours = Math.round(duration / (1e3 * 60 * 60) % 24);
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    return duration < 3600 * 1e3 ? `${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`;
  };
  bot.music.handleMusic = async (playerData, track, mEmbed, options) => {
    const TogglePlayingButton = new discord_js_1.default.ButtonBuilder().setEmoji(config_json_1.default.emojis.pause).setCustomId("TP").setStyle(discord_js_1.ButtonStyle.Danger);
    const LoopButton = new discord_js_1.default.ButtonBuilder().setEmoji(config_json_1.default.emojis.loop).setCustomId("loop").setStyle(discord_js_1.ButtonStyle.Secondary);
    const LyricsButton = new discord_js_1.default.ButtonBuilder().setEmoji(config_json_1.default.emojis.queue).setCustomId("lyrics").setStyle(discord_js_1.ButtonStyle.Secondary);
    const StopButton = new discord_js_1.default.ButtonBuilder().setEmoji(config_json_1.default.emojis.music_stop).setCustomId("stop").setStyle(discord_js_1.ButtonStyle.Danger);
    const buttons = [];
    if ((options == null ? void 0 : options.includePause) === true)
      buttons.push(TogglePlayingButton);
    if ((options == null ? void 0 : options.includeStop) === true)
      buttons.push(StopButton);
    if ((options == null ? void 0 : options.includeLoop) === true)
      buttons.push(LoopButton);
    let lyrics;
    try {
      lyrics = await (await bot.lyricsClient.songs.search(track.title))[0].lyrics();
    } catch (e) {
      lyrics = null;
    }
    if (lyrics && (options == null ? void 0 : options.includeLyrics) === true)
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
    }).catch(() => {
    });
    if (!MusicMessage)
      return;
    let collector;
    if ((options == null ? void 0 : options.createCollector) === true) {
      collector = MusicMessage.createMessageComponentCollector({ time: 1800 * 1e3 });
      collector.on("collect", async (interaction) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
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
          const playerData2 = bot.music.players.get((_a = interaction == null ? void 0 : interaction.guild) == null ? void 0 : _a.id);
          if (!playerData2) {
            await interaction.editT("There is no music playing.");
            collector.stop();
          }
          const loopModes = [0, 1, 2];
          const nextLoopMode = loopModes[track.queue.repeatMode + 1] || 0;
          const loopMode = nextLoopMode === 0 ? `${config_json_1.default.emojis.error} Disabled` : `${config_json_1.default.emojis.success} ${nextLoopMode === 1 ? "`Server Queue`" : "`Current Song`"}`;
          track.queue.setRepeatMode(nextLoopMode).catch(() => {
          });
          embed.title = `${config_json_1.default.emojis.music} | Looping ${loopMode}`;
          embed.description = `Looping is now ${loopMode}.`;
        } else if (interaction.customId === "TP") {
          const playerData2 = bot.music.players.get((_b = interaction == null ? void 0 : interaction.guild) == null ? void 0 : _b.id);
          if (!playerData2) {
            await interaction.editT("There is no music playing.");
            collector.stop();
          }
          if ((playerData2 == null ? void 0 : playerData2.paused) === true) {
            playerData2 == null ? void 0 : playerData2.pause(false);
            embed.title = `${config_json_1.default.emojis.music} | Music Resumed!`;
            embed.description = `Resumed ${(_d = (_c = playerData2 == null ? void 0 : playerData2.queue) == null ? void 0 : _c.current) == null ? void 0 : _d.title} by ${(_f = (_e = playerData2 == null ? void 0 : playerData2.queue) == null ? void 0 : _e.current) == null ? void 0 : _f.author}.`;
            embed.color = discord_js_1.Colors.Green;
            TogglePlayingButton.setEmoji(config_json_1.default.emojis.pause).setStyle(discord_js_1.ButtonStyle.Danger);
          } else {
            playerData2 == null ? void 0 : playerData2.pause(true);
            embed.title = `${config_json_1.default.emojis.music} | Music Paused!`;
            embed.description = `Paused ${(_h = (_g = playerData2 == null ? void 0 : playerData2.queue) == null ? void 0 : _g.current) == null ? void 0 : _h.title} by ${(_j = (_i = playerData2 == null ? void 0 : playerData2.queue) == null ? void 0 : _i.current) == null ? void 0 : _j.author}.`;
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
        } else if (interaction.customId === "stop") {
          const playerData2 = bot.music.players.get((_k = interaction == null ? void 0 : interaction.guild) == null ? void 0 : _k.id);
          if (!playerData2) {
            await interaction.editT("There is no music playing.");
            collector.stop();
          }
          playerData2 == null ? void 0 : playerData2.stop();
          embed.title = `${config_json_1.default.emojis.error} | Music Stopped!`;
          embed.description = `Stopped playing ${(_m = (_l = playerData2 == null ? void 0 : playerData2.queue) == null ? void 0 : _l.current) == null ? void 0 : _m.title} by ${(_o = (_n = playerData2 == null ? void 0 : playerData2.queue) == null ? void 0 : _n.current) == null ? void 0 : _o.author}.`;
          embed.color = discord_js_1.Colors.Red;
        } else if (interaction.customId === "lyrics") {
          embed.title = `${config_json_1.default.emojis.queue} | Song Lyrics`;
          embed.description = lyrics.length >= 4e3 ? `${lyrics.slice(0, 2e3)}...
View more lyrics by running /music lyrics.` : lyrics;
          embed.color = discord_js_1.Colors.Blue;
        }
        interaction.reply({ embeds: [embed], ephemeral: true });
      });
      collector.on("end", async (collected) => {
        if (MusicMessage) {
          try {
            MusicMessage == null ? void 0 : MusicMessage.edit({
              embeds: [mEmbed],
              components: []
            });
          } catch (e) {
          }
        }
      });
    }
    return { msg: MusicMessage, collector };
  };
};
//# sourceMappingURL=music.js.map
