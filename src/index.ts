import { Tags, Colors, Logger } from "@_immails/logger";
import { JuroCord } from "./structures/JuroCord";
const client = new JuroCord();
export default client; 

Logger.config.date_enabled = true;
Tags.create({ key: "commands", label: "CMD", "brackets_color": Colors.FG.GREEN, "label_color": Colors.FG.LIGHTGREEN })
Tags.create({ key: "mongodb", label: "MONGODB", "brackets_color": Colors.FG.GREEN, "label_color": Colors.FG.LIGHTGREEN })
Tags.create({ key: "events", label: "EVENT", "brackets_color": Colors.FG.YELLOW, "label_color": Colors.FG.LIGHTYELLOW })
Tags.create({ key: "bot", label: "SAVIKCORD", "brackets_color": Colors.FG.CYAN, "label_color": Colors.FG.LIGHTCYAN })
Tags.create({ key: "events/player", label: "PLAYER", "brackets_color": Colors.FG.BLUE, "label_color": Colors.FG.LIGHTBLUE })
Tags.create({ key: "events/lavalink", label: "LAVALINK", "brackets_color": Colors.FG.RED, "label_color": Colors.FG.LIGHTRED })

process.on('unhandledRejection', (reason, p) => {
    console.log(reason, p);
});

process.on('uncaughtException', (err, origin) => {
    console.log(err, origin);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log(err, origin);
});