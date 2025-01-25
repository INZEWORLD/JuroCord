import { EmbedBuilder, CommandInteraction, Client, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import db from '../../schema/playlist';
import { convertTime } from '../../utils/convert.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';
import lodash from 'lodash';

export default {
  name: 'info',
  description: 'Получите информацию о сохраненном плейлисте. / Get information about a saved playlist.',
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
            .setDescription(i18next.t(`infono`, { name: `${Name}`})),
        ],
      });
    } 
    let pname = data.PlaylistName;
    let plist = data.Playlist.length;
    let tracks = data.Playlist.map(
      (x, i) =>
        `\`${+i}\` - ${x.title && x.uri ? `[${x.title}](${x.uri})` : `${x.title}`}${
          x.duration ? ` - \`${convertTime(Number(x.duration))}\`` : ''
        }`,
    );
    const pages = lodash.chunk(tracks, 10).map((x) => x.join('\n'));
    let page = 0;

    const embed = new EmbedBuilder()
      .setTitle(i18next.t(`info`, { username: `${interaction.user.username}`}))
      .setColor(client.embedColor)
      .setDescription(i18next.t(`infoplaylist`, { pname: `${pname}`, plist: `${plist}`, pages: `${pages[page]}`}));
    if (pages.length <= 1) {
      return await interaction.editReply({ embeds: [embed] });
    } else {
      let previousbut = new ButtonBuilder()
        .setCustomId('Previous')
        .setEmoji('⏪')
        .setStyle(2);

      let nextbut = new ButtonBuilder().setCustomId('Next').setEmoji('⏩').setStyle(2);

      let stopbut = new ButtonBuilder().setCustomId('Stop').setEmoji('⏹️').setStyle(2);

      const row = new ActionRowBuilder().addComponents(previousbut, stopbut, nextbut);

      await interaction.editReply({ embeds: [embed], components: [row] });

      const collector = interaction.channel.createMessageComponentCollector({
        filter: (b) =>
          b.user.id === interaction.member.user.id
            ? true
            : false && b.deferUpdate().catch(() => {}),
        time: 60000 * 5,
        idle: (60000 * 5) / 2,
      });

      collector.on('end', async () => {
        await interaction.editReply({
          components: [
            new ActionRowBuilder().addComponents(
              previousbut.setDisabled(true),
              stopbut.setDisabled(true),
              nextbut.setDisabled(true),
            ),
          ],
        });
      });

      collector.on('collect', async (b) => {
        if (!b.deferred) await b.deferUpdate().catch(() => {});
        if (b.customId === 'Previous') {
          page = page - 1 < 0 ? pages.length - 1 : --page;

          embed.setDescription(
            i18next.t(`infoplaylist`, { pname: `${pname}`, plist: `${plist}`, pages: `${pages[page]}`}),
          );

          return await interaction.editReply({ embeds: [embed] });
        } else if (b.customId === 'Stop') {
          return collector.stop();
        } else if (b.customId === 'Next')
          page = page + 1 >= pages.length ? 0 : ++page;

        embed.setDescription(
          i18next.t(`infoplaylist`, { pname: `${pname}`, plist: `${plist}`, pages: `${pages[page]}`}),
        );

        return await interaction.editReply({ embeds: [embed] });
      });
    }
  },
};


