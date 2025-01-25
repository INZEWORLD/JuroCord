import { ApplicationCommandData, CacheType, ChatInputCommandInteraction, Interaction, InteractionReplyOptions, Message, MessagePayload, MessageReplyOptions } from "discord.js";
import { EventEmitter } from 'node:events';

export const commandEvents = new EventEmitter();
export const commandRegistry : Map<string, ApplicationCommandData> = new Map();

export function registerCommand(details : ApplicationCommandData, callback: (i: Interaction<CacheType>) => void) {
	commandRegistry.set(details.name, details)
	commandEvents.on(details.name, (i) => {
		callback(i)
	})
}