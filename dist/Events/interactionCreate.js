"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const cooldowns = [];
exports.default = {
    once: false,
    async execute(bot, interaction) {
        if (interaction.type === discord_js_1.InteractionType.ApplicationCommand) {
            const command = bot.commands.get(interaction.commandName);
            if (!command)
                return;
            await interaction.deferReply({
                ephemeral: command.settings.ephemeral || false
            });
            try {
                await command.run(bot, interaction, { options: interaction.options });
            }
            catch (error) {
                bot.logger("Error", error, "red");
                await interaction.followUp({
                    content: `Uh oh! You encountered an ultra rare error. Please join our discord server, create a new forum post, and send the following error.\n\`\`\`${error.message}\`\`\``,
                    ephemeral: true
                });
            }
        }
    }
};
//# sourceMappingURL=interactionCreate.js.map