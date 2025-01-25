import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import db from '../../schema/playlist';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'savecurrent',
  description: 'Добавьте трек в сохраненный плейлист. / Add the track to the saved playlist.',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  options: [
    {
      name: 'name',
      description: 'Название плейлиста / Playlist name',
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

    const player = client.manager.players.get(interaction.guildId);
    if (!player.queue.current) {
      let thing = new EmbedBuilder().setColor('Red').setDescription(i18n.__('player.nomusic'));
      return interaction.editReply({ embeds: [thing] });
    }
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
    const song = player.queue.current;
    let oldSong = data.Playlist;
    if (!Array.isArray(oldSong)) oldSong = [];
    oldSong.push({
      title: song.title,
      uri: song.uri,
      author: song.author,
      duration: song.length,
    });
    await db.updateOne(
      {
        UserId: interaction.user.id,
        PlaylistName: Name,
      },
      {
        $push: {
          Playlist: {
            title: song.title,
            uri: song.uri,
            author: song.author,
            duration: song.length,
          },
        },
      },
    );
    const embed = new EmbedBuilder()
      .setColor(client.embedColor)
      .setDescription(i18next.t(`savecurrent`, { songtitle: `${song.title.substr(0, 256)}`, songuri: `${song.uri}`, name: `${Name}`}));
    return interaction.editReply({ embeds: [embed] });
  },
};
