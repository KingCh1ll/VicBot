import Discord, { Role, Colors, ButtonInteraction } from "discord.js";

import cmd from "../../Structures/command";

async function execute(bot: any, message: any, data: any) {
    console.log(data.getRole("role"))
    const role = message.guild.roles.find((r: any) => r.id == data.getRole("role"))
    if (!role) return message.followUp({ content: "Role couldn't be found in server.", ephemeral: true });

    try {
        message.guild.members.filter((m: any) => !m.user.bot).forEach((member: any) => member.addRole(role));
    } catch (err: any) {
        message.followUp({ content: "Role couldn't be found in server.", ephemeral: true });
    }
}

export default new cmd(execute, {
    description: "Give everybody a role.",
    usage: "(user/icon)",
    perms: ["ManageRoles"],
    bot_perms: ["ManageRoles"],
    options: [{
        type: 8,
        name: "role",
        description: "The role that will be given to everyone.",
        required: true
    }],
    ephemeral: true,
    slash: true
});
