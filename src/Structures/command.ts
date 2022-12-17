import { ChannelType, PermissionsBitField } from "discord.js";

import config from "../config.json";

export default class Command {
  execute: any;
  settings: any;
  constructor(execute: any, sett: any) {
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

  async run(bot: any, message: any, args: string[], command: any, data: any) {
    if (message?.channel?.type === ChannelType.DM) return await message.followUp(`${config.emojis.error} | This command cannot be used in DMs!`);

    const content = `${config.emojis.error} | Sorry, {user} missing the \`{missing}\` permission!`;
    if (message?.author) {
      if (message.guild?.members?.me?.permissions?.has(this.settings.bot_perms) !== true) return await message.edit({ content: content.replaceAll("{user}", "I'm").replaceAll("{missing}", message.guild?.members?.me?.permissions?.missing(this.settings.bot_perms)?.join(`, `)) });
      if (message?.memberPermissions?.has(this.settings.perms) !== true) return await message.editReply({ content: content.replaceAll("{user}", "you're").replaceAll("{missing}", message.memberPermissions.missing(this.settings.perms)?.join(`, `)) });
    } else {
      if (message?.appPermissions?.has(this.settings.bot_perms) !== true) return await message.editReply({ content: content.replaceAll("{user}", "I'm").replaceAll("{missing}", message?.appPermissions?.missing(this.settings.bot_perms)?.join(`, `)) });
      if (message?.memberPermissions?.has(this.settings.perms) !== true) return await message.editReply({ content: content.replaceAll("{user}", "you're").replaceAll("{missing}", message.memberPermissions.missing(this.settings.perms)?.join(`, `)) });
    }

    return this.execute(bot, message, args, command, data);
  }
};
