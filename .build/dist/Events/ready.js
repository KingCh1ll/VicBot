"use strict";
var __importDefault = exports && exports.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const logger_1 = __importDefault(require("../Utils/logger"));
exports.default = {
  once: true,
  async execute(client) {
    var _a;
    (_a = client.user) == null ? void 0 : _a.setPresence({
      status: "online",
      activities: [{
        name: `VicInTheGame`,
        type: discord_js_1.ActivityType.Watching
      }]
    });
    client.music.init(client.user.id);
    (0, logger_1.default)("App", `Connected to Discord as ${client.user.tag}.`);
  }
};
//# sourceMappingURL=ready.js.map