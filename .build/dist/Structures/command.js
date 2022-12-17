"use strict";
var __importDefault = exports && exports.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_json_1 = __importDefault(require("../config.json"));
class Command {
  constructor(execute, sett) {
    this.execute = execute;
    this.settings = Object.assign({
      usage: "{command}",
      cooldown: 2 * 1e3,
      ownerOnly: false,
      enabled: true
    }, sett, {
      perms: ["SendMessages"].concat((sett == null ? void 0 : sett.perms) || []),
      bot_perms: ["EmbedLinks"].concat((sett == null ? void 0 : sett.bot_perms) || [])
    });
  }
  async run(bot, message, args, command, data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    if (((_a = message == null ? void 0 : message.channel) == null ? void 0 : _a.type) === discord_js_1.ChannelType.DM)
      return await message.followUp(`${config_json_1.default.emojis.error} | This command cannot be used in DMs!`);
    const content = `${config_json_1.default.emojis.error} | Sorry, {user} missing the \`{missing}\` permission!`;
    if (message == null ? void 0 : message.author) {
      if (((_e = (_d = (_c = (_b = message.guild) == null ? void 0 : _b.members) == null ? void 0 : _c.me) == null ? void 0 : _d.permissions) == null ? void 0 : _e.has(this.settings.bot_perms)) !== true)
        return await message.edit({ content: content.replaceAll("{user}", "I'm").replaceAll("{missing}", (_j = (_i = (_h = (_g = (_f = message.guild) == null ? void 0 : _f.members) == null ? void 0 : _g.me) == null ? void 0 : _h.permissions) == null ? void 0 : _i.missing(this.settings.bot_perms)) == null ? void 0 : _j.join(`, `)) });
      if (((_k = message == null ? void 0 : message.memberPermissions) == null ? void 0 : _k.has(this.settings.perms)) !== true)
        return await message.editReply({ content: content.replaceAll("{user}", "you're").replaceAll("{missing}", (_l = message.memberPermissions.missing(this.settings.perms)) == null ? void 0 : _l.join(`, `)) });
    } else {
      if (((_m = message == null ? void 0 : message.appPermissions) == null ? void 0 : _m.has(this.settings.bot_perms)) !== true)
        return await message.editReply({ content: content.replaceAll("{user}", "I'm").replaceAll("{missing}", (_o = (_n = message == null ? void 0 : message.appPermissions) == null ? void 0 : _n.missing(this.settings.bot_perms)) == null ? void 0 : _o.join(`, `)) });
      if (((_p = message == null ? void 0 : message.memberPermissions) == null ? void 0 : _p.has(this.settings.perms)) !== true)
        return await message.editReply({ content: content.replaceAll("{user}", "you're").replaceAll("{missing}", (_q = message.memberPermissions.missing(this.settings.perms)) == null ? void 0 : _q.join(`, `)) });
    }
    return this.execute(bot, message, args, command, data);
  }
}
exports.default = Command;
;
//# sourceMappingURL=command.js.map
