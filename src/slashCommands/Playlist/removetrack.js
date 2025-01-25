import { EmbedBuilder, CommandInteraction, Client, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import db from '../../schema/playlist';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'removetrack',
  description: 'Удалить трек из сохраненных плейлистов / Remove a track from saved playlists.',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  options: [
    {
      name: 'name',
      description: 'Название плейлиста / Playlist name',
      required: true,
      type: 3,
    },
    {
      name: 'number',
      description: 'Song number',
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
            .setDescription(i18next.t(`noplaylist`, { name: `${Name}`})),
        ],
      });
    }
    if (data.length == 0) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t(`noplaylist`, { name: `${Name}`})),
        ],
      });
    }
    const Options = interaction.options.getString('number');
    if (!Options || isNaN(Options)) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(
              i18next.t(`numberplaylist`, { name: `${Name}`}),
            ),
        ],
      });
    }
    let tracks = data.Playlist;
    if (Number(Options) >= tracks.length || Number(Options) < 0) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(
              i18next.t(`nonameremove`, { trackslength: `${tracks.length - 1}`, name: `${Name}`})
            ),
        ],
      });
    }
    await db.updateOne(
      {
        UserId: interaction.user.id,
        PlaylistName: Name,
      },
      {
        $pull: {
          Playlist: data.Playlist[Options],
        },
      },
    );
    const embed = new EmbedBuilder()
      .setColor(client.embedColor)
      .setDescription(i18next.t(`removecmd`, { trackstitle: `${tracks[Options].title}`, name: `${Name}`}));
    return interaction.editReply({ embeds: [embed] });
  },
};