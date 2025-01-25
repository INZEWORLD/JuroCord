import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import db from '../../schema/playlist';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'savequeue',
  description: 'Сохраните текущую очередь в свой плейлист. / Save the current play queue to your playlist.',
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
      let thing = new EmbedBuilder().setColor('Red').setDescription(i18next.t(`fnomusic`));
      return interaction.editReply({ embeds: [thing] });
    }

    if (!data) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t(`savequeueno`)),
        ],
      });
    }
    if (data.length == 0) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t(`savequeueno`)),
        ],
      });
    }

    const song = player.queue.current;
    const tracks = player.queue;

    let oldSong = data.Playlist;
    if (!Array.isArray(oldSong)) oldSong = [];
    const newSong = [];
    if (player.queue.current) {
      newSong.push({
        title: song.title,
        uri: song.uri,
        author: song.author,
        duration: song.length,
      });
    }
    for (const track of tracks)
      newSong.push({
        title: track.title,
        uri: track.uri,
        author: track.author,
        duration: track.length,
      });
    const playlist = oldSong.concat(newSong);
    await db.updateOne(
      {
        UserId: interaction.user.id,
        PlaylistName: Name,
      },
      {
        $set: {
          Playlist: playlist,
        },
      },
    );
    const embed = new EmbedBuilder()
      .setDescription(i18next.t(`savequeue`, { playlistlength: `${playlist.length - oldSong.length}`, name: `${Name}`}))
      .setColor(client.embedColor);
    return interaction.editReply({ embeds: [embed] });
  },
};

