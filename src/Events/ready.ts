import Discord, { Client, Colors, ActivityType } from "discord.js";

import client from "../index";
import logger from "../Utils/logger";

export default {
  once: true,
  async execute(client: Client) {
    client.user?.setPresence({
			status: "online",
			activities: [{
				name: `VicInTheGame`,
				type: ActivityType.Watching,
			}]
		});

    (client as any).music.init(client.user.id);

		logger("App", `Connected to Discord as ${client.user.tag}.`);
  }
};