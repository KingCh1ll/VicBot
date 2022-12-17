// KingCh1ll //
// Last Edited: 2/25/2021 //

/* -------------------------------------------------- LIBRARIES --------------------------------------------------*/
import { Client, Collection, GatewayIntentBits, ApplicationCommand } from "discord.js";
import fs from "fs";
import path from "path";
import Util from "util";

import logger from "./Utils/logger";
import music from "./Utils/music";

/* -------------------------------------------------- Client --------------------------------------------------*/
const client: any = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ]
});
client.on("debug", (event: any) => console.log(event))
client.on("ratelimit", () => console.log("RATELIMITED - UH OH!"))

/* -------------------------------------------------- Config --------------------------------------------------*/
client.logger = logger;

client.commands = new Collection();
client.cooldowns = new Collection();

client.wait = Util.promisify(setTimeout);
client.functions = require("./Utils/functions");

client.functions.init(client);
music(client);

/* -------------------------------------------------- Start --------------------------------------------------*/
new Promise(async (resolve: any, reject: any) => {
  console.log(client)
  for (const file of fs.readdirSync(path.resolve(__dirname, `./Events`)).filter(file => file.endsWith(".js"))) {
    const event = (await import(path.resolve(__dirname, `./Events/${file}`))).default;
    const handleArgs = (...args: any) => event.execute(client, ...args);

    event.once ? client.once(file.split(".")[0], handleArgs) : client.on(file.split(".")[0], handleArgs);
  }

  const slashCommands: any = [];
  fs.readdirSync(path.resolve(__dirname, `./Commands/Slash/`)).filter(f => f.endsWith(".js")).map((cmd: any) => {
    let command: any = require(`./Commands/Slash/${cmd}`).default;
    let commandName: any = cmd.split(".")[0];

    if (!command) return;
    command.settings.name = commandName;

    if (client.commands.has(commandName)) return client.logger(`You cannot set command ${commandName} because it is already in use by the command ${client.commands.get(commandName).settings.name}. This is most likely due to a accidental clone of a command with the same name.`, "error");
    client.commands.set(commandName, command);

    if (command.settings.description.length >= 100) command.settings.description = `${command.settings.description.slice(0, 96)}...`;
    command.settings.slash === true && slashCommands.push({
      name: commandName,
      description: command.settings.description,
      options: command.settings.options || [],
      type: 1
    });
  });

  // fs.readdirSync(path.resolve(__dirname, `./Commands/Text`)).filter((file: any) => file.endsWith(".js")).forEach((file: any) => {
  //     const commandname = file.split(".")[0];
  //     const command = require(`./Commands/Text/${file}`)?.default;
  //     if (!command || !command.settings) return;

  //     command.settings.name = commandname;

  //     if (client.commands.has(commandname)) return client.logger(`You cannot set command ${commandname} because it is already in use by the command ${client.commands.get(commandname).settings.name}. This is most likely due to a accidental clone of a command with the same name.`, "error");
  //     client.commands.set(commandname, command);
  // });

  resolve(true);

  const ready = client.readyAt ? Promise.resolve() : new Promise(r => client.once("ready", r));
  await ready;

  const currentCmds = await client.application.commands.fetch().catch((): any => { });

  const newCmds = slashCommands.filter((cmd: any) => !currentCmds.some((c: any) => c.name === cmd.name));
  for (const newCmd of newCmds) await client.application.commands.create(newCmd, "1052414895179702324"); // 1052414895179702324 for guild only commands

  const removedCmds = currentCmds.filter((cmd: any) => !slashCommands.some((c: any) => c.name === cmd.name)).toJSON();
  for (const removedCmd of removedCmds) await removedCmd.delete();

  const updatedCmds = slashCommands.filter((cmd: any) => slashCommands.some((c: any) => c.name === cmd.name));
  for (const updatedCmd of updatedCmds) {
    const newCmd: any = updatedCmd;
    const previousCmd = currentCmds.find((c: any) => c.name === newCmd.name);
    let modified = false;

    if (previousCmd && previousCmd.description !== newCmd.description) modified = true;
    if (!ApplicationCommand.optionsEqual(previousCmd?.options || [], newCmd?.options || [])) modified = true;
    if (previousCmd && modified) await previousCmd.edit(updatedCmd);
  }
}).then(async () => await client.login(process.env.TOKEN));

process.on("uncaughtException", async (err: any) => await logger(`Error [UnE]`, `Unhandled exception error. ${err.stack}.`, "red"));
process.on("unhandledRejection", async (err: any) => !err?.name?.toString()?.includes(`[10008]`) && await logger("Error [UnR]", err?.stack ? err.stack : err, "red"));

export default client;
