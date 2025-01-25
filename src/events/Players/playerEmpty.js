import { EmbedBuilder } from 'discord.js';
import db from '../../schema/setup';
import db2 from '../../schema/autoReconnect';
import { autoplay } from '../../utils/functions';
import { wait } from './../../utils/utils';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
	name: 'playerEmpty',
	run: async (client, player) => {
		    // Проверяет установлен ли язык на сервере Discord
			await checkServerLanguage(player.guildId);
		if (player.data.get('message') && player.data.get('message').deletable) player.data.get('message').delete().catch(() => null);
		if (player.data.get("autoplay")) {
			player.previous = player.data.get("autoplaySystem");
			return autoplay(player);
		}
		const guild = client.guilds.cache.get(player.guildId); if (!guild) return;
		const data = await db.findOne({ Guild: guild.id });
		const mode24_7 = await db2.findOne({ Guild: player.guildId });
		const channel = data ? guild.channels.cache.get(data.Channel) : null

		if(!mode24_7) player.destroy() 
		client.channels.cache.get(player.textId)?.send({
			embeds: [
				new EmbedBuilder()
					.setColor(client.embedColor)
					.setDescription(mode24_7 ? i18next.t(`p247on`) : i18next.t(`p247off`))
					.setTimestamp(),
			],
		}).then(async (msg) => {
			await wait(10000);
			msg.delete().catch(() => {})
		});

		if(channel) channel.messages.fetch(data.Message, { cache: true }).then((playerMessage) => {
			playerMessage.edit({embeds: [
				new EmbedBuilder().setColor(client.embedColor)
				.setTitle(i18next.t(`pdestorytitle`))
				.setDescription(i18next.t(`pdescription`, { linksinvite: `${client.config.links.invite}`, linkssupport: `${client.config.links.support}`}))
				.setImage(client.config.links.bg)
			]}).catch(() => {});
		})
	},
};
