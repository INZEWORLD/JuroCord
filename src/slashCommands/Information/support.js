import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'support',
  description: 'Предоставляет ссылку на наш сервер поддержки. / Provides a link to our support server',
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

    var support = client.config.links.support;
    var color = client.embedColor;
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Support Server').setStyle('Link').setURL(support),
    );
    const embed = new EmbedBuilder()
      .setDescription(i18next.t(`supportlink`, { support: `${support}`}))
      .setColor(color);
    await interaction.editReply({ embeds: [embed], components: [row] });
  },
};
