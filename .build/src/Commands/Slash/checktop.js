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
  default: () => checktop_default
});
var import_command = __toModule(require("../../Structures/command"));
let cache = [];
setInterval(() => cache = [], 60 * 1e3);
let OGRole;
let TopOGRole;
async function execute(bot, message, data) {
  let members = cache.find((c) => {
    var _a;
    return (_a = c == null ? void 0 : c.user) == null ? void 0 : _a.id;
  }) ? cache : await message.guild.members.fetch();
  cache = members;
  members = members.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).toJSON();
  const position = new Promise((ful) => {
    for (let i = 1; i < members.length + 1; i++) {
      if (members[i - 1].id === message.user.id)
        ful(i);
    }
  });
  if (await position <= 500) {
    if (!OGRole)
      OGRole = message.guild.roles.cache.get("1053082586274082856");
    await message.member.roles.add(OGRole).catch(() => null);
    if (await position <= 100) {
      if (!TopOGRole)
        TopOGRole = message.guild.roles.cache.get("1053082544175841330");
      await message.member.roles.add(TopOGRole).catch(() => null);
    }
  }
  await message.editReply(`You were the **${await position}th person** to join the server, out of **${members.length}** people. ${await position >= 500 ? `You are not eligible for the top 500th OG role.` : `You are eligible for the top 500th OG role${await position >= 100 ? "." : ", and the top 100th OG role!"}`}`);
}
var checktop_default = new import_command.default(execute, {
  description: "Check everybody in the server to see if they are the top 100, and top 500 members.",
  usage: "",
  perms: [],
  bot_perms: ["ManageRoles"],
  ephemeral: false,
  slash: true,
  options: [{
    type: 6,
    name: "user",
    description: "The user to check. Leave blank to check yourself."
  }]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=checktop.js.map
