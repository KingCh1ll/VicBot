"use strict";
var __importDefault = exports && exports.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = __importDefault(require("../../Structures/command"));
const config_json_1 = __importDefault(require("../../config.json"));
const Emotes = [config_json_1.default.emojis.numbers.one, config_json_1.default.emojis.numbers.two, config_json_1.default.emojis.numbers.three, config_json_1.default.emojis.numbers.four, config_json_1.default.emojis.numbers.five, config_json_1.default.emojis.numbers.six, config_json_1.default.emojis.numbers.seven, config_json_1.default.emojis.numbers.eight, config_json_1.default.emojis.numbers.nine, "\u{1F51F}"];
async function execute(bot, message, args, command, data) {
  var _a, _b, _c, _d, _e, _f;
  if (!((_b = (_a = message == null ? void 0 : message.member) == null ? void 0 : _a.voice) == null ? void 0 : _b.channel))
    return message.followUp(`${config_json_1.default.emojis.alert} | You must be in a voice channel to use this command.`);
  let playerData = bot.music.players.get((_c = message == null ? void 0 : message.guild) == null ? void 0 : _c.id);
  let track = (_d = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _d.current;
  let lyrics;
  try {
    lyrics = await (await bot.lyricsClient.songs.search(track.title))[0].lyrics();
  } catch (e) {
    lyrics = null;
  }
  const TogglePlayingButton = { type: 2, emoji: config_json_1.default.emojis.pause, customId: "TP", style: 4 };
  const LoopButton = { type: 2, emoji: config_json_1.default.emojis.loop, customId: "loop", style: 2 };
  const LyricsButton = { type: 2, emoji: config_json_1.default.emojis.queue, customId: "lyrics", style: 2 };
  const StopButton = { type: 2, emoji: config_json_1.default.emojis.music_stop, customId: "stop", style: 4 };
  const playButton = { type: 2, emoji: config_json_1.default.emojis.plus, customId: "play", style: 2 };
  let mEmbed = {
    title: `${config_json_1.default.emojis.music} | ${track ? `Currently Playing ${track == null ? void 0 : track.title}` : "No Songs Playing"}`,
    url: track == null ? void 0 : track.uri,
    thumbnail: { url: track == null ? void 0 : track.thumbnail },
    fields: [{
      name: `${config_json_1.default.emojis.player} Uploader`,
      value: `\`\`\`${(track == null ? void 0 : track.author) || "Unknown"}\`\`\``,
      inline: true
    }, {
      name: `${config_json_1.default.emojis.clock} Duration`,
      value: `\`\`\`${(track == null ? void 0 : track.duration) || "0:00"}\`\`\``,
      inline: true
    }, {
      name: `${config_json_1.default.emojis.clock} Song Progress`,
      value: `\`\`\`${bot.functions.splitBar(0, (track == null ? void 0 : track.duration) || 40, 45)}\`\`\``,
      inline: false
    }, {
      name: `${config_json_1.default.emojis.music} Songs [${((_e = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _e.totalSize) || 0}]`,
      value: `${(playerData == null ? void 0 : playerData.queue) ? `\`${(_f = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _f.map((song, id) => `${Emotes[id] || id + 1} **${song.title}** - ${bot.music.formatDuration(song.duration)}`).slice(0, 10)}\`` : `> ${config_json_1.default.emojis.alert} No songs are in queue. Tap the plus button below to add a song!`}`,
      inline: false
    }, {
      name: `${config_json_1.default.emojis.volume} Volume`,
      value: `\`${(playerData == null ? void 0 : playerData.volume) || 100}%\``,
      inline: true
    }, {
      name: `${config_json_1.default.emojis.loop} Loop`,
      value: `${(playerData == null ? void 0 : playerData.trackRepeat) ? `${config_json_1.default.emojis.success} \`Enabled: Song\`` : (playerData == null ? void 0 : playerData.queueRepeat) ? `${config_json_1.default.emojis.success} \`Enabled: Queue\`` : `${config_json_1.default.emojis.error} \`Disabled\``}`,
      inline: true
    }],
    color: discord_js_1.Colors.Blue,
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
      emoji: config_json_1.default.emojis.slash
    }, {
      label: "Forward",
      description: "Tap to forward the song by 10 seconds.",
      value: "forward",
      emoji: config_json_1.default.emojis.slash
    }, {
      label: "Rewind",
      description: "Tap to rewind the song by 10 seconds.",
      value: "rewind",
      emoji: config_json_1.default.emojis.slash
    }]
  };
  let buttons = [];
  track ? buttons.push({ type: 1, components: [playButton, TogglePlayingButton, StopButton, LoopButton] }) : buttons.push({ type: 1, components: [playButton] });
  track && lyrics ? buttons[0].components.push(LyricsButton) : null;
  track && buttons.push({ type: 1, components: [moreOptions] });
  let mainScreen = true;
  const msg = await message.followUp({
    embeds: [mEmbed],
    components: buttons,
    fetchfollowUp: true
  });
  async function refreshMenu() {
    var _a2, _b2, _c2, _d2, _e2, _f2, _g, _h, _i;
    await bot.wait(3e3);
    buttons = [];
    playerData = bot.music.players.get((_a2 = message == null ? void 0 : message.guild) == null ? void 0 : _a2.id);
    track = (_b2 = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _b2.current;
    track ? buttons.push({ type: 1, components: [playButton, TogglePlayingButton, StopButton, LoopButton] }) : buttons.push({ type: 1, components: [playButton] });
    track && lyrics ? buttons[0].components.push(LyricsButton) : null;
    track && buttons.push({ type: 1, components: [moreOptions] });
    mEmbed = {
      title: `${config_json_1.default.emojis.music} | ${track ? `Currently Playing ${track == null ? void 0 : track.title}` : "No Songs Playing"}`,
      url: track == null ? void 0 : track.uri,
      thumbnail: { url: track == null ? void 0 : track.thumbnail },
      fields: [{
        name: `${config_json_1.default.emojis.player} Uploader`,
        value: `\`\`\`${(track == null ? void 0 : track.author) || "Unknown"}\`\`\``,
        inline: true
      }, {
        name: `${config_json_1.default.emojis.clock} Duration`,
        value: `\`\`\`00:00/${bot.music.formatDuration(track == null ? void 0 : track.duration)}\`\`\``,
        inline: true
      }, {
        name: `${config_json_1.default.emojis.clock} Song Progress`,
        value: `\`\`\`${bot.functions.splitBar(0, (track == null ? void 0 : track.duration) || 40, 45)}\`\`\``,
        inline: false
      }, {
        name: `${config_json_1.default.emojis.music} Songs [${((_c2 = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _c2.totalSize) || 0}]`,
        value: `${(playerData == null ? void 0 : playerData.queue) ? `${((_d2 = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _d2.current) ? `> ${Emotes[0]} ${(_f2 = (_e2 = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _e2.current) == null ? void 0 : _f2.title} - ${bot.music.formatDuration((_h = (_g = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _g.current) == null ? void 0 : _h.duration)}
` : ""}${(_i = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _i.map((song, id) => `> ${Emotes[id] || id + 1} ${song.title.length >= 30 ? song.title.slice(0, 30) + "..." : song.title} - ${bot.music.formatDuration(song.duration)}`).slice(0, 10).join("\n").slice(0, 1024)}` : `> ${config_json_1.default.emojis.alert} No songs are in queue. Tap the plus button below to add a song!`}`,
        inline: false
      }, {
        name: `${config_json_1.default.emojis.volume} Volume`,
        value: `\`${(playerData == null ? void 0 : playerData.volume) || 100}%\``,
        inline: true
      }, {
        name: `${config_json_1.default.emojis.loop} Loop`,
        value: `${(playerData == null ? void 0 : playerData.trackRepeat) ? `${config_json_1.default.emojis.success} \`Enabled: Song\`` : (playerData == null ? void 0 : playerData.queueRepeat) ? `${config_json_1.default.emojis.success} \`Enabled: Queue\`` : `${config_json_1.default.emojis.error} \`Disabled\``}`,
        inline: true
      }],
      color: discord_js_1.Colors.Blue,
      timestamp: new Date()
    };
    await msg.edit({
      embeds: [mEmbed],
      components: buttons,
      fetchfollowUp: true
    });
    if (mainScreen === true) {
      const updateMusic = setInterval(async () => {
        var _a3, _b3, _c3, _d3, _e3, _f3, _g2, _h2, _i2, _j, _k;
        if (mainScreen === false)
          return clearInterval(updateMusic);
        playerData = bot.music.players.get((_a3 = message == null ? void 0 : message.guild) == null ? void 0 : _a3.id);
        if (((_b3 = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _b3.playing) === false && ((_c3 = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _c3.paused) === false)
          return clearInterval(updateMusic);
        if (((_d3 = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _d3.paused) === true)
          return;
        mEmbed.fields = [{
          name: `${config_json_1.default.emojis.player} Uploader`,
          value: `\`\`\`${track == null ? void 0 : track.author}\`\`\``,
          inline: true
        }, {
          name: `${config_json_1.default.emojis.clock} Duration`,
          value: `\`\`\`${bot.music.formatDuration(playerData == null ? void 0 : playerData.position)}/${bot.music.formatDuration(track == null ? void 0 : track.duration)}\`\`\``,
          inline: true
        }, {
          name: `${config_json_1.default.emojis.clock} Song Progress`,
          value: `\`\`\`${bot.functions.splitBar(playerData == null ? void 0 : playerData.position, (track == null ? void 0 : track.duration) || 50, 45)}\`\`\``,
          inline: false
        }, {
          name: `${config_json_1.default.emojis.music} Songs [${((_e3 = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _e3.totalSize) || 0}]`,
          value: `${(playerData == null ? void 0 : playerData.queue) ? `${((_f3 = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _f3.current) ? `> ${Emotes[0]} ${(_h2 = (_g2 = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _g2.current) == null ? void 0 : _h2.title} - ${bot.music.formatDuration((_j = (_i2 = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _i2.current) == null ? void 0 : _j.duration)}
` : ""}${(_k = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _k.map((song, id) => `> ${Emotes[id] || id + 1} ${song.title.length >= 30 ? song.title.slice(0, 30) + "..." : song.title} - ${bot.music.formatDuration(song.duration)}`).slice(0, 10).join("\n").slice(0, 1024)}` : `> ${config_json_1.default.emojis.alert} No songs are in queue. Tap the plus button below to add a song!`}`,
          inline: false
        }, {
          name: `${config_json_1.default.emojis.volume} Volume`,
          value: `\`${(playerData == null ? void 0 : playerData.volume) || 100}%\``,
          inline: true
        }, {
          name: `${config_json_1.default.emojis.loop} Loop`,
          value: `${(playerData == null ? void 0 : playerData.trackRepeat) ? `${config_json_1.default.emojis.success} \`Enabled: Song\`` : (playerData == null ? void 0 : playerData.queueRepeat) ? `${config_json_1.default.emojis.success} \`Enabled: Queue\`` : `${config_json_1.default.emojis.error} \`Disabled\``}`,
          inline: true
        }];
        try {
          await (msg == null ? void 0 : msg.edit({ embeds: [mEmbed] }));
        } catch (e) {
          clearInterval(updateMusic);
        }
      }, 7.5 * 1e3);
    }
  }
  const collector = msg.createMessageComponentCollector({ time: 1800 * 1e3 });
  collector.on("collect", async (interaction) => {
    var _a2, _b2, _c2, _d2, _e2, _f2, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
    interaction.customId !== "play" && await interaction.deferUpdate().catch(() => {
    });
    playerData = bot.music.players.get(message.guild.id);
    switch (interaction.customId) {
      case "play": {
        interaction == null ? void 0 : interaction.showModal({
          title: `Add Song`,
          custom_id: "add_song",
          components: [{
            type: 1,
            components: [{
              type: 4,
              custom_id: "song_title",
              label: "Song Title/URL",
              style: 2,
              min_length: 3,
              max_length: 2e3,
              value: "",
              required: true
            }]
          }]
        });
        const modal = await (interaction == null ? void 0 : interaction.awaitModalSubmit({
          filter: (inter) => inter.customId === "add_song" && inter.user.id === interaction.user.id,
          time: 300 * 1e3
        }).catch(() => {
        }));
        if (!modal)
          return console.error("[Music System]: Model is null. Debug: ", modal);
        modal.deferUpdate().catch(() => {
        });
        const query = modal.fields.getTextInputValue("song_title");
        await msg.edit({
          embeds: [{
            author: { name: (_a2 = interaction.user) == null ? void 0 : _a2.username, iconURL: (_b2 = interaction.user) == null ? void 0 : _b2.displayAvatarURL() },
            title: `${config_json_1.default.emojis.search} Searching for **${query}**...`,
            color: discord_js_1.Colors.Blue
          }]
        });
        let spotify = (query == null ? void 0 : query.includes("spotify:")) || (query == null ? void 0 : query.includes("open.spotify.com"));
        const search = await bot.music.search({ query, requester: message.user });
        const tracks = spotify == true ? search == null ? void 0 : search.tracks[0] : (search == null ? void 0 : search.tracks[0]) ? search == null ? void 0 : search.tracks[0] : search == null ? void 0 : search.tracks;
        if (!tracks)
          return await message.followUp(`${config_json_1.default.emojis.alert} | No results found for that query.`);
        if (!((_d2 = (_c2 = message == null ? void 0 : message.member) == null ? void 0 : _c2.voice) == null ? void 0 : _d2.channel))
          return await message.followUp(`${config_json_1.default.emojis.alert} | Please join a voice channel.`);
        const player = bot.music.create({
          guild: message.guild.id,
          voiceChannel: message.member.voice.channel.id,
          textChannel: message.channel.id,
          selfDeafen: true
        });
        player.connect();
        player.queue.add(tracks);
        if (!player.playing && !player.paused && !player.queue.length)
          player.play();
        mainScreen = true;
        refreshMenu();
        break;
      }
      case "stop": {
        if (playerData && playerData.queue)
          playerData == null ? void 0 : playerData.destroy();
        else if ((_g = (_f2 = (_e2 = message == null ? void 0 : message.guild) == null ? void 0 : _e2.me) == null ? void 0 : _f2.voice) == null ? void 0 : _g.channel)
          message.guild.me.voice.disconnect().catch(() => {
          });
        await interaction.followUp({
          embeds: [{
            author: { name: (_h = interaction.user) == null ? void 0 : _h.username, iconURL: (_i = interaction.user) == null ? void 0 : _i.displayAvatarURL() },
            title: `${config_json_1.default.emojis.error} | Music Stopped!`,
            description: `Stopped playing ${(_k = (_j = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _j.current) == null ? void 0 : _k.title} by ${(_m = (_l = playerData == null ? void 0 : playerData.queue) == null ? void 0 : _l.current) == null ? void 0 : _m.author}.`,
            color: discord_js_1.Colors.Red
          }]
        });
        break;
      }
      case "lyrics": {
        await interaction.followUp({
          embeds: [{
            author: { name: (_n = interaction.user) == null ? void 0 : _n.username, iconURL: (_o = interaction.user) == null ? void 0 : _o.displayAvatarURL() },
            title: `${config_json_1.default.emojis.queue} | Song Lyrics`,
            description: lyrics.length >= 4e3 ? `${lyrics.slice(0, 2e3)}...
View more lyrics by running /music lyrics.` : lyrics,
            color: discord_js_1.Colors.Green
          }],
          ephemeral: true
        });
        break;
      }
      case "TP": {
        if ((playerData == null ? void 0 : playerData.paused) === true) {
          playerData == null ? void 0 : playerData.pause(false);
          TogglePlayingButton.emoji = config_json_1.default.emojis.pause;
          TogglePlayingButton.style = 4;
        } else {
          playerData == null ? void 0 : playerData.pause(true);
          TogglePlayingButton.emoji = config_json_1.default.emojis.arrows.right;
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
      }
      case "loop": {
        const playerData2 = bot.music.players.get((_p = interaction == null ? void 0 : interaction.guild) == null ? void 0 : _p.id);
        if (!playerData2) {
          await interaction.editT("There is no music playing.");
          collector.stop();
        }
        if (playerData2 == null ? void 0 : playerData2.trackRepeat) {
          playerData2.setTrackRepeat(false);
          playerData2.setQueueRepeat(true);
        } else if (playerData2 == null ? void 0 : playerData2.queueRepeat) {
          playerData2.setTrackRepeat(false);
          playerData2.setQueueRepeat(false);
        } else {
          playerData2.setTrackRepeat(true);
        }
        refreshMenu();
        break;
      }
      case "more_options": {
        if (!(interaction == null ? void 0 : interaction.values[0]))
          return;
        if (interaction.values[0].toLowerCase() === "skip") {
          playerData.stop();
        } else if (interaction.values[0].toLowerCase() === "forward") {
          let forward = playerData.queue.currentTime + 10;
          if (forward < 0)
            forward = 0;
          if (forward >= playerData.queue.songs[0].duration)
            forward = playerData.queue.songs[0].duration - 1;
          await playerData.queue.seek(forward);
        } else if (interaction.values[0].toLowerCase() === "rewind") {
          let rewind = playerData.queue.currentTime - 10;
          if (rewind < 0)
            rewind = 0;
          if (rewind >= playerData.queue.songs[0].duration - playerData.queue.currentTime)
            rewind = 0;
          await playerData.queue.seek(rewind);
        }
      }
    }
  });
  collector.on("end", async (collected) => msg == null ? void 0 : msg.edit({ embeds: [mEmbed], components: [] }));
}
exports.default = new command_1.default(execute, {
  description: "Play music in your Discord server.",
  dirname: __dirname,
  aliases: [],
  usage: "",
  slash: true
});
//# sourceMappingURL=music.js.map
