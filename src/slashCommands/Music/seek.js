import { CommandInteraction, Client, EmbedBuilder } from 'discord.js';
import { convertTime } from '../../utils/convert.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';
import ms from 'ms';

export default {
  name: 'seek',
  description: 'Перемотка на любой фрагмент трека / Search for currently playing song',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  dj: true,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  options: [
    {
      name: 'time',
      description: '<10s || 10m || 10h>',
      required: true,
      type: 3,
    },
  ],

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction, prefix) => {
    await interaction.deferReply({
      ephemeral: false,
    });
    // Проверяет установлен ли язык на сервере Discord
    await checkServerLanguage(interaction.guildId);

    const player = client.manager.players.get(interaction.guild.id);

    if (!player.queue.current) {
      let thing = new EmbedBuilder().setColor('Red').setDescription(i18next.t('fnomusic'));
      return interaction.editReply({ embeds: [thing] });
    }

    const time2 = interaction.options.getString("time");
    const time = ms(time2);
    const position = player.shoukaku.position;
    const duration = player.queue.current.length;

    const emojiforward = client.emoji.forward;
    const emojirewind = client.emoji.rewind;

    const song = player.queue.current;

    if (time <= duration) {
      if (time > position) {
        await player.shoukaku.seekTo(time);
        let thing = new EmbedBuilder()
          .setDescription(
            i18next.t(`seeknext`, { emojiforward: `${emojiforward}`, songtitle: `${song.title}`, songuri: `${song.uri}`, converttimetime:  `${convertTime(time,)}`, converttimeduration: `${convertTime(duration)}`}),
          )
          .setColor(client.embedColor);
        return interaction.editReply({ embeds: [thing] });
      } else {
        await player.shoukaku.seekTo(time);
        let thing = new EmbedBuilder()
          .setDescription(
            i18next.t(`seekback`, { emojirewind: `${emojirewind}`, songtitle: `${song.title}`, songuri: `${song.uri}`, converttimetime: `${convertTime(time,)}`, converttimeduration: `${convertTime(duration)}`}),
          )
          .setColor(client.embedColor);
        return interaction.editReply({ embeds: [thing] });
      }
    } else {
      let thing = new EmbedBuilder()
        .setColor('Red')
        .setDescription(
          i18next.t(`seek`, { converttimeduration: `${convertTime(duration)}`}),
        );
      return interaction.editReply({ embeds: [thing] });
    }
  },
};

