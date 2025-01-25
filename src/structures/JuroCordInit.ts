import { Kazagumo, Plugins } from "kazagumo";
import Spotify from "kazagumo-spotify"
import { JuroCord, clientEvent } from "./JuroCord";
import { readdirSync } from "fs";
import { connect, connections, set } from "mongoose";
import { Connectors } from "shoukaku";
import shoukakuOptions from "../utils/options.js"
import { Colors, Logger, Tags } from "@_immails/logger";
import { noun } from "../utils/utils";
import { commandEvents } from "../utils/commandRegistry";

/**
 * Loads music player
 */
export function _loadPlayer(client : JuroCord) : Kazagumo {
    client.manager = new Kazagumo({
        plugins: [
            new Spotify({
                clientId: client.config.SpotifyID,
                clientSecret: client.config.SpotifySecret,
                playlistPageLimit: 100, 
                albumPageLimit: 50, 
                searchLimit: 50, 
                searchMarket: 'RU',
            }),
            new Plugins.PlayerMoved(client),
        ],
        defaultSearchEngine: "youtube",
        send: (guildId, payload) => {
            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        }
    }, new Connectors.DiscordJS(client), client.config.nodes, shoukakuOptions);
    client.manager.shoukaku.on("error", (_, error) => console.error(error));
    return client.manager;
}

/**
 * Loads client events
 */
export async function _loadClientEvents(client : JuroCord) {
    for(let file of readdirSync("./src/events/Client")) {
        const event : clientEvent = (await import(`../events/Client/${file}`)).default as clientEvent;
        let eventName = file.split(".")[0];
        //client.logger.log(`Загрузка событий клиента ${eventName}`, "event");
        client.on(event.name, (...args) => event.run(client, ...args));
        Logger.log([Tags.INFO, Tags.get("events"), Tags.get("bot")], `Загружено ${Colors.FG.LIGHTGREEN + eventName}`)
    };
};

/**
 * Loads lavalink events
 */
export async function _loadNodeEvents(client : JuroCord) {
    for(let file of readdirSync("./src/events/Node")) {
        const event = await import(`../events/Node/${file}`);
        let eventName = file.split(".")[0];
        //client.logger.log(`Загрузка событий Lavalink  ${eventName}`, "event");
        client.manager.shoukaku.on(event.name, (...args) => event.run(client, ...args));
        Logger.log([Tags.INFO, Tags.get("events"), Tags.get("events/lavalink")], `Загружено ${Colors.FG.LIGHTGREEN + eventName}`)
    };
};

/**
 * Loads music player events
 */
export async function _loadPlayerEvents(client : JuroCord) {
    for(let file of readdirSync("./src/events/Players")) {
        const event = await import(`../events/Players/${file}`);
        let eventName = file.split(".")[0];
        //client.logger.log(`Загрузка событий ${eventName}`, "event");
        client.manager.on(event.default.name, (...args) => {
            event.default.run(client, ...args)
        });
        Logger.log([Tags.INFO, Tags.get("events"), Tags.get("events/player")], `Загружено ${Colors.FG.LIGHTGREEN + eventName}`)
    };
};

/**
 * Imports new commands
 */
export function _loadCommands(client : JuroCord) {
    readdirSync("./src/commands").forEach(async dir => {
        // const commandFiles = readdirSync(`./src/commands/${dir}/`).filter(f => f.endsWith('.js'));
        // for (const file of commandFiles) {
        //     const command = await import(`../commands/${dir}/${file}`);
        //     client.logger.log(`[ • ] Команды загружены: ${command.category} - ${command.name}`, "cmd");
        //     client.commands.set(command.name, command);
        // }
        // ↑ Раскомментируй, если нужна поддержка префиксных комманд
        // ↓ Закомментируй, если не нужна поддержка слеш команд, регистрируемыми функцией registerCommand внутри каждой директории в папке ./src/commands/
        for(const dir of readdirSync("./src/commands")) {
            for (const file of readdirSync(`./src/commands/${dir}/`).filter((files) => files.endsWith(".js") || files.endsWith(".ts"))) {
                await import(`../commands/${dir}/${file}`);
                Logger.log([Tags.INFO, Tags.get("commands")], `Загружен модуль команд ${file}`)
            }
        };
        client.on("interactionCreate", (i) => {
            // @ts-ignore
			if(i.commandName) commandEvents.emit(i.commandName || "~unknown", i)
		})
        Logger.log([Tags.INFO, Tags.get("commands")], `Загружены все модули команд`)
    });
};

/**
 * Loads slash commands
 */
export async function _loadSlashCommands(client : JuroCord) {
    const data = [];
    for(let dir of readdirSync("./src/slashCommands")) {
        const slashCommandFile = readdirSync(`./src/slashCommands/${dir}/`).filter((files) => files.endsWith(".js") || files.endsWith(".ts"));
        for (const file of slashCommandFile) {
            const slashCommand = await import(`../slashCommands/${dir}/${file}`);
            //client.logger.log(`[ / ] Загрузка слеш команды: ${slashCommand.name || slashCommand.default.name}`, "cmd");
            if (!slashCommand.name && !slashCommand.default.name) return console.error(`slashCommandNameError: ${file} требуется имя команды приложения.`);
            if (!slashCommand.description && !slashCommand.default.description) return console.error(`slashCommandDescriptionError: ${file} требуется описание команды приложения.`);
            slashCommand.default["category"] = dir
            client.slashCommands.set(slashCommand.name || slashCommand.default.name, slashCommand.default || slashCommand);
            data.push(slashCommand.default || slashCommand);
            Logger.log([Tags.INFO, Tags.get("commands")], `Загружена команда`, `${Colors.FG.LIGHTGREEN}${slashCommand.name || slashCommand.default.name}`)
        }
    };
    client.on("ready", async () => {
        await client.application.commands.set(data).then(() => Logger.log([Tags.INFO, Tags.get("commands")], `Загружено`, client.application.commands.cache.size, noun(client.application.commands.cache.size, "команда", "команды", "команд"))).catch((e) => console.log(e));
    });
}

/**
 * Connects to the MongoDB
 */
export async function _connectMongodb(client : JuroCord) {
    const dbOptions = {
        useNewUrlParser: true,
        autoIndex: false,
        connectTimeoutMS: 1000,
        family: 4,
        useUnifiedTopology: true,
    };
    set('strictQuery', true);
    connect(client.config.mongourl, dbOptions);
    // Promise = global.Promise;
    let connection = connections[0]
    connection.on("connected", () => {
        // client.logger.log("[DB] БАЗА ДАННЫХ ПОДКЛЮЧЕНА", "ready");
        Logger.log([Tags.INFO, Tags.get("mongodb")], "Соединение установлено")
    });
    connection.on("err", (err) => {
        //client.logger.log(`[DB] Ошибка подключения к MongoDB: \n ${err.stack}`, "error");
        Logger.log([Tags.ERROR, Tags.get("mongodb")], "Ошибка: ", err.stack)
    });
    connection.on("disconnected", () => {
        //client.logger.log("[DB] MongoDB отключен", "error");
        Logger.log([Tags.WARN, Tags.get("mongodb")], "Соединение потеряно")
    });
}