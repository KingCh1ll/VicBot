"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
let bot;
module.exports = {
  init(client) {
    if (!client)
      throw new TypeError("Discord client must be valid.");
    bot = client;
  },
  splitBar(current, total, size = 40, line = "\u25AC", slider = "\u{1F518}") {
    if (current > total) {
      return line.repeat(size + 2);
    } else {
      const percent = current / total;
      const progress = Math.round(size * percent);
      const progLeft = size - progress;
      return line.repeat(progress).replace(/.$/, slider) + line.repeat(progLeft);
    }
  },
  cleanContent(content, channel) {
    return content.replace(/<@!?[0-9]+>/g, (input) => {
      const id = input.replace(/<|!|>|@/g, "");
      if (channel.type === discord_js_1.ChannelType.DM) {
        const user = channel.client.users.cache.get(id);
        return user ? `@${user.username}`.replaceAll("@", "@\u200B") : input;
      }
      const member = channel.guild.members.cache.get(id);
      if (member) {
        return `@${member.displayName}`.replaceAll("@", "@\u200B");
      } else {
        const user = channel.client.users.cache.get(id);
        return user ? `@${user.username}`.replaceAll("@", "@\u200B") : input;
      }
    }).replace(/<#[0-9]+>/g, (input) => {
      const mentionedChannel = channel.client.channels.cache.get(input.replace(/<|#|>/g, ""));
      return mentionedChannel ? `#${mentionedChannel.name}` : input;
    }).replace(/<@&[0-9]+>/g, (input) => {
      if (channel.type === discord_js_1.ChannelType.DM)
        return input;
      const role = channel.guild.roles.cache.get(input.replace(/<|@|>|&/g, ""));
      return role ? `@${role.name}` : input;
    });
  },
  formatNumber(Number) {
    if (typeof Number === "string")
      Number = parseInt(Number);
    const DecPlaces = Math.pow(10, 1);
    const Abbrev = ["k", "m", "g", "t", "p", "e"];
    for (let i = Abbrev.length - 1; i >= 0; i--) {
      const Size = Math.pow(10, (i + 1) * 3);
      if (Size <= Number) {
        Number = Math.round(Number * DecPlaces / Size) / DecPlaces;
        if (Number === 1e3 && i < Abbrev.length - 1) {
          Number = 1;
          i++;
        }
        Number += Abbrev[i];
        break;
      }
    }
    return Number;
  },
  MSToTime(ms, type = "long") {
    const RoundNumber = ms > 0 ? Math.floor : Math.ceil;
    const Months = RoundNumber(ms / 26298e5);
    const Days = RoundNumber(ms / 864e5) % 30.4167;
    const Hours = RoundNumber(ms / 36e5) % 24;
    const Mins = RoundNumber(ms / 6e4) % 60;
    const Secs = RoundNumber(ms / 1e3) % 60;
    let time;
    if (type === "long") {
      time = Months > 0 ? `${Months} Month${Months === 1 ? "" : "s"}, ` : "";
      time += Days > 0 ? `${Days} Day${Days === 1 ? "" : "s"}, ` : "";
      time += Hours > 0 ? `${Hours} Hour${Hours === 1 ? "" : "s"}, ` : "";
      time += Mins > 0 ? `${Mins} Minute${Mins === 1 ? "" : "s"} & ` : "";
      time += Secs > 0 ? `${Secs} Second${Secs === 1 ? "" : "s"}` : "0 Seconds";
    } else if (type === "short") {
      time = Months > 0 ? `${Months}m ` : "";
      time += Days > 0 ? `${Days}d ` : "";
      time += Hours > 0 ? `${Hours}h ` : "";
      time += Mins > 0 ? `${Mins}m ` : "";
      time += Secs > 0 ? `${Secs}s` : "0s";
    }
    return time;
  },
  async GetServerCount() {
    const promises = [bot.cluster.broadcastEval("this.guilds.cache.size")];
    return Promise.all(promises).then((results) => results.flat().reduce((acc, ServerCount) => acc + ServerCount, 0));
  },
  async GetUserCount() {
    const promises = [bot.cluster.broadcastEval("let users = 0; this.guilds.cache.map(server => (users += server.memberCount));")];
    return Promise.all(promises).then((res) => res.flat().reduce((acc, count) => acc + count, 0));
  }
};
//# sourceMappingURL=functions.js.map
