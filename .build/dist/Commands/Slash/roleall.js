"use strict";
var __importDefault = exports && exports.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __importDefault(require("../../Structures/command"));
async function execute(bot, message, data) {
  console.log(data.getRole("role"));
  const role = message.guild.roles.find((r) => r.id == data.getRole("role"));
  if (!role)
    return message.followUp({ content: "Role couldn't be found in server.", ephemeral: true });
  try {
    message.guild.members.filter((m) => !m.user.bot).forEach((member) => member.addRole(role));
  } catch (err) {
    message.followUp({ content: "Role couldn't be found in server.", ephemeral: true });
  }
}
exports.default = new command_1.default(execute, {
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
//# sourceMappingURL=roleall.js.map
