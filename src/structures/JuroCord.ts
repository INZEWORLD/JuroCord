import { Client, IntentsBitField, Collection, ColorResolvable, resolveColor, ApplicationCommand, GuildResolvable, ApplicationCommandType, ChatInputApplicationCommandData, ApplicationCommandData, ApplicationCommandOptionType } from "discord.js";
import { Kazagumo } from "kazagumo";

import config from "../config.js"
import logger from "../utils/logger.js"
import { default as emoji } from "../utils/emoji"
import { Logger } from "@_immails/logger";

export interface clientEvent { name: string, run: Function }

export class JuroCord extends Client {
	commands : Collection<string, any>;
	applicationCommands = [];
	slashCommands : Collection<string, any>;
	config : config
	owner : string
	prefix : string
	embedColor : ColorResolvable
	aliases : Collection<string, any>;
	manager : Kazagumo
	logger = logger;
	emoji = emoji;
	constructor() {
		const time = Logger.time("Время запуска: ")
		super({
			shards: "auto",
			allowedMentions: {
				parse: ["roles", "users", "everyone"],
				repliedUser: false
			},
			intents: [
				IntentsBitField.Flags.GuildMessages,
				IntentsBitField.Flags.GuildMembers,
				IntentsBitField.Flags.GuildVoiceStates,
				IntentsBitField.Flags.Guilds,
				IntentsBitField.Flags.MessageContent,
			]
		});
		this.commands = new Collection();
		this.slashCommands = new Collection();
		this.config = config;
		this.embedColor = this.config.embedColor
		this.owner = this.config.ownerID;
		this.prefix = this.config.prefix;
		this.aliases = new Collection();
		if (!this.token) this.token = this.config.token;

		import("./JuroCordInit").then(async (module) => {
			await Promise.all([
				module._loadPlayer(this),
				module._loadClientEvents(this),
				module._loadNodeEvents(this),
				module._loadPlayerEvents(this), 
				module._loadSlashCommands(this),
				module._connectMongodb(this),
			])
			await this.login(this.token)
			time();
		})
	}
};