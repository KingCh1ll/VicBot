import chalk, { Chalk } from "chalk";

export default async (type: string, content: string, color?: keyof Chalk) => {
	if (!content || !type) return;

	const typeColor: any = chalk[color ?? "grey"];
	const contentColor: any = chalk[color ?? "white"]

	console.log(`[${typeColor(type)}] ${contentColor(content)}`)
};
