"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_json_1 = __importDefault(require("../config.json"));
class Command {
    constructor(execute, sett) {
        this.execute = execute;
        this.settings = Object.assign({
            usage: "{command}",
            cooldown: 2 * 1000,
            ownerOnly: false,
            enabled: true
        }, sett, {
            perms: ["SendMessages"].concat(sett?.perms || []),
            bot_perms: ["EmbedLinks"].concat(sett?.bot_perms || [])
        });
    }
    async run(bot, message, args, command, data) {
        if (message?.channel?.type === discord_js_1.ChannelType.DM)
            return await message.followUp(`${config_json_1.default.emojis.error} | This command cannot be used in DMs!`);
        const content = `${config_json_1.default.emojis.error} | Sorry, {user} missing the \`{missing}\` permission!`;
        if (message?.author) {
            if (message.guild?.members?.me?.permissions?.has(this.settings.bot_perms) !== true)
                return await message.edit({ content: content.replaceAll("{user}", "I'm").replaceAll("{missing}", message.guild?.members?.me?.permissions?.missing(this.settings.bot_perms)?.join(`, `)) });
            if (message?.memberPermissions?.has(this.settings.perms) !== true)
                return await message.editReply({ content: content.replaceAll("{user}", "you're").replaceAll("{missing}", message.memberPermissions.missing(this.settings.perms)?.join(`, `)) });
        }
        else {
            if (message?.appPermissions?.has(this.settings.bot_perms) !== true)
                return await message.editReply({ content: content.replaceAll("{user}", "I'm").replaceAll("{missing}", message?.appPermissions?.missing(this.settings.bot_perms)?.join(`, `)) });
            if (message?.memberPermissions?.has(this.settings.perms) !== true)
                return await message.editReply({ content: content.replaceAll("{user}", "you're").replaceAll("{missing}", message.memberPermissions.missing(this.settings.perms)?.join(`, `)) });
        }
        return this.execute(bot, message, args, command, data);
    }
}
exports.default = Command;
;
//# sourceMappingURL=command.js.map