var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
__export(exports, {
  default: () => music_default
});
var import_discord = __toModule(require("discord.js"));
var import_genius_lyrics = __toModule(require("genius-lyrics"));
var import_erela = __toModule(require("erela.js"));
var import_erela2 = __toModule(require("erela.js-spotify"));
var import_logger = __toModule(require("./logger"));
var import_config = __toModule(require("../config.json"));
var music_default = (bot) => {
  bot.lyricsClient = new import_genius_lyrics.Client(process.env.GENIUS);
  bot.music = new import_erela.Manager({
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
      new import_erela2.default({
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
  bot.music.on("nodeConnect", (node) => (0, import_logger.default)("Music System", `Node ${node.options.identifier} connected`, "green")).on("nodeError", (node, error) => (0, import_logger.default)("Music System", `Node ${node.options.identifier} had an error: ${error.message}`, "red")).on("trackStuck", async (player, track) => {
    const guild = bot.guilds.cache.get(player.guild);
    const channel = guild.channels.cache.get(player.textChannel) || await guild.channels.fetch(player.textChannel).catch(() => {
    });
    channel && await channel.send({
      embeds: [{
        description: `${import_config.default.emojis.alert} | **Error Occured**
An error occurred while playing the song.`,
        color: import_discord.Colors.Red,
        timestamp: new Date()
      }]
    });
  }).on("queueEnd", async (player) => {
    const guild = bot.guilds.cache.get(player.guild);
    const channel = guild.channels.cache.get(player.textChannel) || await guild.channels.fetch(player.textChannel);
    await channel.send({
      embeds: [{
        description: `${import_config.default.emojis.alert} | **Queue Ended**
Add more songs to keep playing more music.`,
        color: import_discord.Colors.Red,
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
    const TogglePlayingButton = new import_discord.default.ButtonBuilder().setEmoji(import_config.default.emojis.pause).setCustomId("TP").setStyle(import_discord.ButtonStyle.Danger);
    const LoopButton = new import_discord.default.ButtonBuilder().setEmoji(import_config.default.emojis.loop).setCustomId("loop").setStyle(import_discord.ButtonStyle.Secondary);
    const LyricsButton = new import_discord.default.ButtonBuilder().setEmoji(import_config.default.emojis.queue).setCustomId("lyrics").setStyle(import_discord.ButtonStyle.Secondary);
    const StopButton = new import_discord.default.ButtonBuilder().setEmoji(import_config.default.emojis.music_stop).setCustomId("stop").setStyle(import_discord.ButtonStyle.Danger);
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
          color: import_discord.Colors.Blue,
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
          const loopMode = nextLoopMode === 0 ? `${import_config.default.emojis.error} Disabled` : `${import_config.default.emojis.success} ${nextLoopMode === 1 ? "`Server Queue`" : "`Current Song`"}`;
          track.queue.setRepeatMode(nextLoopMode).catch(() => {
          });
          embed.title = `${import_config.default.emojis.music} | Looping ${loopMode}`;
          embed.description = `Looping is now ${loopMode}.`;
        } else if (interaction.customId === "TP") {
          const playerData2 = bot.music.players.get((_b = interaction == null ? void 0 : interaction.guild) == null ? void 0 : _b.id);
          if (!playerData2) {
            await interaction.editT("There is no music playing.");
            collector.stop();
          }
          if ((playerData2 == null ? void 0 : playerData2.paused) === true) {
            playerData2 == null ? void 0 : playerData2.pause(false);
            embed.title = `${import_config.default.emojis.music} | Music Resumed!`;
            embed.description = `Resumed ${(_d = (_c = playerData2 == null ? void 0 : playerData2.queue) == null ? void 0 : _c.current) == null ? void 0 : _d.title} by ${(_f = (_e = playerData2 == null ? void 0 : playerData2.queue) == null ? void 0 : _e.current) == null ? void 0 : _f.author}.`;
            embed.color = import_discord.Colors.Green;
            TogglePlayingButton.setEmoji(import_config.default.emojis.pause).setStyle(import_discord.ButtonStyle.Danger);
          } else {
            playerData2 == null ? void 0 : playerData2.pause(true);
            embed.title = `${import_config.default.emojis.music} | Music Paused!`;
            embed.description = `Paused ${(_h = (_g = playerData2 == null ? void 0 : playerData2.queue) == null ? void 0 : _g.current) == null ? void 0 : _h.title} by ${(_j = (_i = playerData2 == null ? void 0 : playerData2.queue) == null ? void 0 : _i.current) == null ? void 0 : _j.author}.`;
            embed.color = import_discord.Colors.Red;
            TogglePlayingButton.setEmoji(import_config.default.emojis.arrows.right).setStyle(import_discord.ButtonStyle.Success);
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
          embed.title = `${import_config.default.emojis.error} | Music Stopped!`;
          embed.description = `Stopped playing ${(_m = (_l = playerData2 == null ? void 0 : playerData2.queue) == null ? void 0 : _l.current) == null ? void 0 : _m.title} by ${(_o = (_n = playerData2 == null ? void 0 : playerData2.queue) == null ? void 0 : _n.current) == null ? void 0 : _o.author}.`;
          embed.color = import_discord.Colors.Red;
        } else if (interaction.customId === "lyrics") {
          embed.title = `${import_config.default.emojis.queue} | Song Lyrics`;
          embed.description = lyrics.length >= 4e3 ? `${lyrics.slice(0, 2e3)}...
View more lyrics by running /music lyrics.` : lyrics;
          embed.color = import_discord.Colors.Blue;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=music.js.map
