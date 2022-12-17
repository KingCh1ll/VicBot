// KingCh1ll //
// 10/24/2022 //

import express from "express";

import logger from "./Utils/logger";

export default new Promise((resolve, reject) => {
	let num: number = 0;
	const loader: NodeJS.Timer = setInterval(() => { process.stdout.write(`\r${["\\", "|", "/", "-"][num++]} [App] Loading...`); num %= 4; }, 250);
	setTimeout(() => { clearInterval(loader); resolve(process.stdout.write(`\r- [App] Loading...`)); }, 5000);
}).then(() => {
  console.clear();
  require("./app");

  const app = express();
  app.get("/", (req: any, res: any) => res.status(200).send({ status: 200, message: "Bot is online and ready." }));
  app.listen(process.env.PORT, () => logger("App", "Listening to port 3000."));
});
