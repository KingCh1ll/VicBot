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
  default: () => Command
});
var import_discord = __toModule(require("discord.js"));
var import_config = __toModule(require("../config.json"));
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
    if (((_a = message == null ? void 0 : message.channel) == null ? void 0 : _a.type) === import_discord.ChannelType.DM)
      return await message.followUp(`${import_config.default.emojis.error} | This command cannot be used in DMs!`);
    const content = `${import_config.default.emojis.error} | Sorry, {user} missing the \`{missing}\` permission!`;
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
;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=command.js.map
