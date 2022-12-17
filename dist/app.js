"use strict";
// KingCh1ll //
// Last Edited: 2/25/2021 //
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* -------------------------------------------------- LIBRARIES --------------------------------------------------*/
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
const logger_1 = __importDefault(require("./Utils/logger"));
const music_1 = __importDefault(require("./Utils/music"));
/* -------------------------------------------------- Client --------------------------------------------------*/
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildVoiceStates,
        discord_js_1.GatewayIntentBits.MessageContent
    ]
});
client.on("debug", (event) => console.log(event));
client.on("ratelimit", () => console.log("RATELIMITED - UH OH!"));
/* -------------------------------------------------- Config --------------------------------------------------*/
client.logger = logger_1.default;
client.commands = new discord_js_1.Collection();
client.cooldowns = new discord_js_1.Collection();
client.wait = util_1.default.promisify(setTimeout);
client.functions = require("./Utils/functions");
client.functions.init(client);
(0, music_1.default)(client);
/* -------------------------------------------------- Start --------------------------------------------------*/
new Promise(async (resolve, reject) => {
    var _a;
    console.log(client);
    for (const file of fs_1.default.readdirSync(path_1.default.resolve(__dirname, `./Events`)).filter(file => file.endsWith(".js"))) {
        const event = (await (_a = path_1.default.resolve(__dirname, `./Events/${file}`), Promise.resolve().then(() => __importStar(require(_a))))).default;
        const handleArgs = (...args) => event.execute(client, ...args);
        event.once ? client.once(file.split(".")[0], handleArgs) : client.on(file.split(".")[0], handleArgs);
    }
    const slashCommands = [];
    fs_1.default.readdirSync(path_1.default.resolve(__dirname, `./Commands/Slash/`)).filter(f => f.endsWith(".js")).map((cmd) => {
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
    const currentCmds = await client.application.commands.fetch().catch(() => { });
    const newCmds = slashCommands.filter((cmd) => !currentCmds.some((c) => c.name === cmd.name));
    for (const newCmd of newCmds)
        await client.application.commands.create(newCmd, "1052414895179702324"); // 1052414895179702324 for guild only commands
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
        if (!discord_js_1.ApplicationCommand.optionsEqual(previousCmd?.options || [], newCmd?.options || []))
            modified = true;
        if (previousCmd && modified)
            await previousCmd.edit(updatedCmd);
    }
}).then(async () => await client.login(process.env.TOKEN));
process.on("uncaughtException", async (err) => await (0, logger_1.default)(`Error [UnE]`, `Unhandled exception error. ${err.stack}.`, "red"));
process.on("unhandledRejection", async (err) => !err?.name?.toString()?.includes(`[10008]`) && await (0, logger_1.default)("Error [UnR]", err?.stack ? err.stack : err, "red"));
exports.default = client;
//# sourceMappingURL=app.js.map