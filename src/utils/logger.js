import chalk from 'chalk';
import moment from 'moment';

export default class {
	static log(content, type = "log") {
		const date = `${moment().format("DD-MM-YYYY hh:mm:ss")}`;
		switch (type) {
			case "log":
				return console.log(`[${chalk.yellow(date)}]: [${chalk.black.bgBlue(type.toUpperCase())}] ${chalk.blue(content)}`);
			case "warn":
				return console.log(`[${chalk.yellow(date)}]: [${chalk.black.bgYellow(type.toUpperCase())}] ${chalk.blue(content)}`);
			case "error":
				return console.log(`[${chalk.yellow(date)}]: [${chalk.black.bgRed(type.toUpperCase())}] ${chalk.blue(content)}`);
			case "debug":
				return console.log(`[${chalk.yellow(date)}]: [${chalk.black.bgGreen(type.toUpperCase())}] ${chalk.blue(content)}`);
			case "cmd":
				return console.log(`[${chalk.yellow(date)}]: [${chalk.black.bgWhite(type.toUpperCase())}] ${chalk.blue(content)}`);
			case "event":
				return console.log(`[${chalk.yellow(date)}]: [${chalk.black.bgHex('#e1f507')(type.toUpperCase())}] ${chalk.blue(content)}`);
			case "ready":
				return console.log(`[${chalk.yellow(date)}]: [${chalk.black.bgHex('#067032')(type.toUpperCase())}] ${chalk.blue(content)}`);
			default: throw new TypeError("Тип логгера должен быть либо warn, debug, log, ready, cmd or error.");
		}
	}
	static timeMap = new Map();
	static logConsoleTime(id, finished) {
		if(finished) {
			const date = `${moment().format("DD-MM-YYYY hh:mm:ss")}`;
			let elapsed = Date.now() - this.timeMap.get(id)
			this.timeMap.delete(id)
			console.log(`[${chalk.yellow(date)}]: [${chalk.black.bgBlue("TIME")}] ${id}: ${chalk.blue(elapsed)} ms.`);
			return elapsed
		} else {
			this.timeMap.set(id, Date.now())
		}
	}
}