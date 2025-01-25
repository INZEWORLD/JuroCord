import { EmbedBuilder, CommandInteraction, Client, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import db from '../../schema/playlist';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';
import lodash from 'lodash';

export default {
  name: 'list',
  description: 'Просмотреть список плейлистов. / View a playlist.',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,

  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction) => {
    await interaction.deferReply({});
    // Проверяет установлен ли язык на сервере Discord
    await checkServerLanguage(interaction.guildId);
    const data = await db.find({ UserId: interaction.member.user.id });

    if (!data.length) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t(`listno`)),
        ],
      });
    }

    let list = data.map(
      (x, i) => `\`${++i}\` - ${x.PlaylistName} \`${x.Playlist.length}\` - <t:${x.CreatedOn}>`,
    );
    const pages = lodash.chunk(list, 10).map((x) => x.join('\n'));
    let page = 0;

    const embeds = new EmbedBuilder()
      .setAuthor({
        name: i18next.t(`list`, { username: `${interaction.user.username}`}),
        iconURI: interaction.user.displayAvatarURL(),
      })
      .setDescription(pages[page])
      .setColor(client.embedColor);
    return await interaction.editReply({ embeds: [embeds] });
  },
};
