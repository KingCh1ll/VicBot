"use strict";
var __importDefault = exports && exports.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("./Utils/logger"));
exports.default = new Promise((resolve, reject) => {
  let num = 0;
  const loader = setInterval(() => {
    process.stdout.write(`\r${["\\", "|", "/", "-"][num++]} [App] Loading...`);
    num %= 4;
  }, 250);
  setTimeout(() => {
    clearInterval(loader);
    resolve(process.stdout.write(`\r- [App] Loading...`));
  }, 5e3);
}).then(() => {
  console.clear();
  require("./app");
  const app = (0, express_1.default)();
  app.get("/", (req, res) => res.status(200).send({ status: 200, message: "Bot is online and ready." }));
  app.listen(process.env.PORT, () => (0, logger_1.default)("App", "Listening to port 3000."));
});
//# sourceMappingURL=index.js.map
