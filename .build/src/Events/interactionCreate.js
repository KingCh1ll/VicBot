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
  default: () => interactionCreate_default
});
var import_discord = __toModule(require("discord.js"));
const cooldowns = [];
var interactionCreate_default = {
  once: false,
  async execute(bot, interaction) {
    if (interaction.type === import_discord.InteractionType.ApplicationCommand) {
      const command = bot.commands.get(interaction.commandName);
      if (!command)
        return;
      await interaction.deferReply({
        ephemeral: command.settings.ephemeral || false
      });
      try {
        await command.run(bot, interaction, { options: interaction.options });
      } catch (error) {
        bot.logger("Error", error, "red");
        await interaction.followUp({
          content: `Uh oh! You encountered an ultra rare error. Please join our discord server, create a new forum post, and send the following error.
\`\`\`${error.message}\`\`\``,
          ephemeral: true
        });
      }
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=interactionCreate.js.map
