import Discord, { Role, Colors, ButtonInteraction } from "discord.js";

import cmd from "../../Structures/command";

let cache: any[] = [];
setInterval(() => cache = [], 120 * 1000);

let OGRole: any;
let TopOGRole: any;

async function execute(bot: any, message: any, data: any) {
  let members = cache.find((c) => c?.user?.id) ? cache : await message.guild.members.fetch();
  cache = members;
  members = members
    .sort((a: any, b: any) => a.joinedTimestamp - b.joinedTimestamp)
    .toJSON();

  const position = new Promise((ful) => {
    for (let i = 1; i < members.length + 1; i++) {
      if (members[i - 1].id === message.user.id) ful(i);
    }
  })

  if (await position <= 500) {
    if (!OGRole) OGRole = message.guild.roles.cache.get("1053082586274082856");
    await message.member.roles.add(OGRole).catch((): any => null);

    if (await position <= 100) {
      if (!TopOGRole) TopOGRole = message.guild.roles.cache.get("1053082544175841330");
      await message.member.roles.add(TopOGRole).catch((): any => null);
    }
  }

  await message.editReply(`You were the **${await position}th person** to join the server, out of **${members.length}** people. ${await position >= 500 ? `You are not eligible for the top 500th OG role.` : `You are eligible for the top 500th OG role${await position >= 100 ? "." : ", and the top 100th OG role!"}`}`);
}

export default new cmd(execute, {
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
