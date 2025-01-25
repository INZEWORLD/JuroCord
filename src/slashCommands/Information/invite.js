import { EmbedBuilder, CommandInteraction, Client, ButtonBuilder, ActionRowBuilder } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: "invite",
  description: "Получить ссылку на приглашения JuroCord / Get a link to Savik's invitations",
  userPrams: [],
  botPrams: ['EMBED_LINKS'],

  /**
   * 
   * @param {Client} client 
   * @param {CommandInteraction} interaction 
   */

  run: async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: false
    });

      // Проверяет установлен ли язык на сервере Discord
      await checkServerLanguage(interaction.guildId);

    var invite = client.config.links.invite;
    var color = client.embedColor
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel(i18next.t("link"))
          .setStyle("Link")
          .setURL(invite)
      );

    const mainPage = new EmbedBuilder()
      .setDescription(i18next.t(`invite`, { invite: `${invite}` }))
      .setColor(color)
    interaction.editReply({ embeds: [mainPage], components: [row] })
  }
};