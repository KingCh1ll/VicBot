import Discord, { Colors, InteractionType } from "discord.js";

const cooldowns: any[] = [];

export default {
	once: false,
	async execute(bot: any, interaction: any) {
		if (interaction.type === InteractionType.ApplicationCommand) {
			const command = bot.commands.get(interaction.commandName);
			if (!command) return;

			await interaction.deferReply({
				ephemeral: command.settings.ephemeral || false
			});

			try {
				await command.run(bot, interaction, { options: interaction.options });
			} catch (error: any) {
				bot.logger("Error", error, "red");

				await interaction.followUp({
					content: `Uh oh! You encountered an ultra rare error. Please join our discord server, create a new forum post, and send the following error.\n\`\`\`${error.message}\`\`\``,
					ephemeral: true
				});
			}
		}
	}
};
