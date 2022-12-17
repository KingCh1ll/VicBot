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
  default: () => src_default
});
var import_express = __toModule(require("express"));
var import_logger = __toModule(require("./Utils/logger"));
var src_default = new Promise((resolve, reject) => {
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
  const app = (0, import_express.default)();
  app.get("/", (req, res) => res.status(200).send({ status: 200, message: "Bot is online and ready." }));
  app.listen(process.env.PORT, () => (0, import_logger.default)("App", "Listening to port 3000."));
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=index.js.map
