var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
__export(exports, {
  default: () => app_default
});
var import_discord = __toModule(require("discord.js"));
var import_fs = __toModule(require("fs"));
var import_path = __toModule(require("path"));
var import_util = __toModule(require("util"));
var import_logger = __toModule(require("./Utils/logger"));
var import_music = __toModule(require("./Utils/music"));
const client = new import_discord.Client({
  intents: [
    import_discord.GatewayIntentBits.Guilds,
    import_discord.GatewayIntentBits.GuildMembers,
    import_discord.GatewayIntentBits.GuildMessages,
    import_discord.GatewayIntentBits.GuildVoiceStates,
    import_discord.GatewayIntentBits.MessageContent
  ]
});
client.on("debug", (event) => console.log(event));
client.on("ratelimit", () => console.log("RATELIMITED - UH OH!"));
client.logger = import_logger.default;
client.commands = new import_discord.Collection();
client.cooldowns = new import_discord.Collection();
client.wait = import_util.default.promisify(setTimeout);
client.functions = require("./Utils/functions");
client.functions.init(client);
(0, import_music.default)(client);
new Promise(async (resolve, reject) => {
  console.log(client);
  for (const file of import_fs.default.readdirSync(import_path.default.resolve(__dirname, `./Events`)).filter((file2) => file2.endsWith(".js"))) {
    const event = (await import(import_path.default.resolve(__dirname, `./Events/${file}`))).default;
    const handleArgs = (...args) => event.execute(client, ...args);
    event.once ? client.once(file.split(".")[0], handleArgs) : client.on(file.split(".")[0], handleArgs);
  }
  const slashCommands = [];
  import_fs.default.readdirSync(import_path.default.resolve(__dirname, `./Commands/Slash/`)).filter((f) => f.endsWith(".js")).map((cmd) => {
    let command = require(`./Commands/Slash/${cmd}`).default;
    let commandName = cmd.split(".")[0];
    if (!command)
      return;
    command.settings.name = commandName;
    if (client.commands.has(commandName))
      return client.logger(`You cannot set command ${commandName} because it is already in use by the command ${client.commands.get(commandName).settings.name}. This is most likely due to a accidental clone of a command with the same name.`, "error");
    client.commands.set(commandName, command);
    if (command.settings.description.length >= 100)
      command.settings.description = `${command.settings.description.slice(0, 96)}...`;
    command.settings.slash === true && slashCommands.push({
      name: commandName,
      description: command.settings.description,
      options: command.settings.options || [],
      type: 1
    });
  });
  resolve(true);
  const ready = client.readyAt ? Promise.resolve() : new Promise((r) => client.once("ready", r));
  await ready;
  const currentCmds = await client.application.commands.fetch().catch(() => {
  });
  const newCmds = slashCommands.filter((cmd) => !currentCmds.some((c) => c.name === cmd.name));
  for (const newCmd of newCmds)
    await client.application.commands.create(newCmd, "1052414895179702324");
  const removedCmds = currentCmds.filter((cmd) => !slashCommands.some((c) => c.name === cmd.name)).toJSON();
  for (const removedCmd of removedCmds)
    await removedCmd.delete();
  const updatedCmds = slashCommands.filter((cmd) => slashCommands.some((c) => c.name === cmd.name));
  for (const updatedCmd of updatedCmds) {
    const newCmd = updatedCmd;
    const previousCmd = currentCmds.find((c) => c.name === newCmd.name);
    let modified = false;
    if (previousCmd && previousCmd.description !== newCmd.description)
      modified = true;
    if (!import_discord.ApplicationCommand.optionsEqual((previousCmd == null ? void 0 : previousCmd.options) || [], (newCmd == null ? void 0 : newCmd.options) || []))
      modified = true;
    if (previousCmd && modified)
      await previousCmd.edit(updatedCmd);
  }
}).then(async () => await client.login(process.env.TOKEN));
process.on("uncaughtException", async (err) => await (0, import_logger.default)(`Error [UnE]`, `Unhandled exception error. ${err.stack}.`, "red"));
process.on("unhandledRejection", async (err) => {
  var _a, _b;
  return !((_b = (_a = err == null ? void 0 : err.name) == null ? void 0 : _a.toString()) == null ? void 0 : _b.includes(`[10008]`)) && await (0, import_logger.default)("Error [UnR]", (err == null ? void 0 : err.stack) ? err.stack : err, "red");
});
var app_default = client;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=app.js.map
