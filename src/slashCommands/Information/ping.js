import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'ping',
  description: 'Проверка пинг-бота / Ping bot check',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],

  /**
   * 
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: false,
    });
    
      // Проверяет установлен ли язык на сервере Discord
      await checkServerLanguage(interaction.guildId);

    await interaction.editReply({ content: i18next.t('ping_load') }).then(async () => {
      const ping = Date.now() - interaction.createdAt;
      const api_ping = client.ws.ping;

      await interaction.editReply({
        content: ' ',
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t('ping', { ping: `${ping}`, api_ping: `${api_ping}` })), //// Можно так же испоользовать i18next.t('ping', { ping: ping, api_ping: api_ping } ///////
        ],
      });
    });
  },
};
