import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import db from '../../schema/playlist';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'delete',
  description: 'Удалить сохраненный плейлист. / Delete saved playlist.',
  usage: '<Playlist name>',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  options: [
    {
      name: 'name',
      description: 'Playlist name',
      required: true,
      type: 3,
    },
  ],
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction) => {
    await interaction.deferReply({});
    // Проверяет установлен ли язык на сервере Discord
    await checkServerLanguage(interaction.guildId);

    const Name = interaction.options.getString('name');
    const data = await db.findOne({ UserId: interaction.member.user.id, PlaylistName: Name });

    if (!data) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t(`deleteno`, { name: `${Name}`})),
        ],
      });
    }

    if (data.length == 0) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t(`deleteno`, { name: `${Name}`})),
        ],
      });
    }

    await data.delete();
    const embed = new EmbedBuilder()
      .setColor(client.embedColor)
      .setDescription(i18next.t(`delete`, { name: `${Name}`}));
    return interaction.editReply({ embeds: [embed] });
  },
};
