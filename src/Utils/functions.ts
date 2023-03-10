import { ChannelType } from "discord.js";

let bot: any;

module.exports = {
	/**
   * Initilizes functions.
   * @param {Object} client Discord client.
   */
	init(client: any) {
		if (!client) throw new TypeError("Discord client must be valid.");

		bot = client;
	},

	/**
	 * Split bar. A nice little progress bar.
	 * @param {number} current The current progress.
	 * @param {number} total The total progress.
	 * @param {number} size The size of the progress bar.
	 * @param {string} line The line of the progress bar. Default: ▬
	 * @param {string} slider The slider emoji. Default: 🔘
	 * @returns {string} The progress bar, as a string.
	 */
	splitBar(current: number, total: number, size = 40, line = "▬", slider = "🔘") {
		if (current > total) {
			return line.repeat(size + 2);
		} else {
			const percent = current / total;
			const progress = Math.round(size * percent);
			const progLeft = size - progress;

			return line.repeat(progress).replace(/.$/, slider) + line.repeat(progLeft);
		}
	},

	cleanContent(content: string, channel: any) {
		return content.replace(/<@!?[0-9]+>/g, input => {
			const id = input.replace(/<|!|>|@/g, "");
			if (channel.type === ChannelType.DM) {
				const user = channel.client.users.cache.get(id);
				return user ? `@${user.username}`.replaceAll("@", "@\u200b") : input;
			}

			const member = channel.guild.members.cache.get(id);
			if (member) {
				return `@${member.displayName}`.replaceAll("@", "@\u200b");
			} else {
				const user = channel.client.users.cache.get(id);
				return user ? `@${user.username}`.replaceAll("@", "@\u200b") : input;
			}
		}).replace(/<#[0-9]+>/g, input => {
			const mentionedChannel = channel.client.channels.cache.get(input.replace(/<|#|>/g, ""));
			return mentionedChannel ? `#${mentionedChannel.name}` : input;
		}).replace(/<@&[0-9]+>/g, input => {
			if (channel.type === ChannelType.DM) return input;
			const role = channel.guild.roles.cache.get(input.replace(/<|@|>|&/g, ""));
			return role ? `@${role.name}` : input;
		});
	},

	/**
   *
   * @param {number} Number The number to format.
   * @returns {string} The formatted number.
   */
	formatNumber(Number: any) {
		if (typeof Number === "string") Number = parseInt(Number);

		const DecPlaces = Math.pow(10, 1);
		const Abbrev = ["k", "m", "g", "t", "p", "e"];

		for (let i = Abbrev.length - 1; i >= 0; i--) {
			const Size = Math.pow(10, (i + 1) * 3);

			if (Size <= Number) {
				Number = Math.round((Number * DecPlaces) / Size) / DecPlaces;

				if (Number === 1000 && i < Abbrev.length - 1) {
					Number = 1;
					i++;
				}

				Number += Abbrev[i];
				break;
			}
		}

		return Number;
	},

	/**
   *
   * @param {number} ms The ms to convert to a time.
   * @param {string} type The type of formatted time. (long/short)
   * @returns {string} The time.
   */
	MSToTime(ms: number, type = "long") {
		const RoundNumber = ms > 0 ? Math.floor : Math.ceil;
		const Months = RoundNumber(ms / 2629800000);
		const Days = RoundNumber(ms / 86400000) % 30.4167;
		const Hours = RoundNumber(ms / 3600000) % 24;
		const Mins = RoundNumber(ms / 60000) % 60;
		const Secs = RoundNumber(ms / 1000) % 60;

		let time;
		if (type === "long") {
			time = Months > 0 ? `${Months} Month${Months === 1 ? "" : "s"}, ` : "";
			time += Days > 0 ? `${Days} Day${Days === 1 ? "" : "s"}, ` : "";
			time += Hours > 0 ? `${Hours} Hour${Hours === 1 ? "" : "s"}, ` : "";
			time += Mins > 0 ? `${Mins} Minute${Mins === 1 ? "" : "s"} & ` : "";
			time += Secs > 0 ? `${Secs} Second${Secs === 1 ? "" : "s"}` : "0 Seconds";
		} else if (type === "short") {
			time = Months > 0 ? `${Months}m ` : "";
			time += Days > 0 ? `${Days}d ` : "";
			time += Hours > 0 ? `${Hours}h ` : "";
			time += Mins > 0 ? `${Mins}m ` : "";
			time += Secs > 0 ? `${Secs}s` : "0s";
		}

		return time;
	},

	/**
   * Get's all of the bot's guilds and counts them up.
   * @returns {string} Server count
   */
	async GetServerCount() {
		const promises = [bot.cluster.broadcastEval("this.guilds.cache.size")];
		return Promise.all(promises).then(results => results.flat().reduce((acc, ServerCount) => acc + ServerCount, 0));
	},

	/**
   * Get's all of the bot"s guilds and counts the user count.
   * @returns {string} User count
   */
	async GetUserCount() {
		const promises = [bot.cluster.broadcastEval("let users = 0; this.guilds.cache.map(server => (users += server.memberCount));")];
		return Promise.all(promises).then(res => res.flat().reduce((acc, count) => acc + count, 0));
	}
};
