import { EmbedBuilder } from 'discord.js';
import db from '../../schema/setup';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
	name: "playerEnd",
	run: async (client, player) => {
		if (player.data.get("message") && player.data.get("message").deletable ) player.data.get("message").delete().catch(() => null);
		
		let guild = client.guilds.cache.get(player.guildId);
		if (!guild) return;
		const data = await db.findOne({ Guild: guild.id });
		if (!data) return;
		let channel = guild.channels.cache.get(data.Channel);
		if (!channel) return;

		let message;

		try {

			message = await channel.messages.fetch(data.Message, { cache: true });

		} catch (e) { };
    // Проверяет установлен ли язык на сервере Discord
    await checkServerLanguage(player.guildId);

		if (!message) return;
		await message.edit({ embeds: [new EmbedBuilder()
			.setColor(client.embedColor)
			.setTitle(i18next.t(`pdestorytitle`))
			.setDescription(i18next.t(`pdescription`, { linksinvite: `${client.config.links.invite}`, linkssupport: `${client.config.links.support}`}))
			.setImage(client.config.links.bg)] })
			.catch(() => { });
	}
};