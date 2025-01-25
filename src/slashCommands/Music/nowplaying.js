import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import { convertTime } from '../../utils/convert.js';
import { progressbar } from '../../utils/progressbar.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'nowplaying',
  description: 'Показать воспроизводимую песню / Show song playing',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  player: true,
  inVoiceChannel: false,
  sameVoiceChannel: false,
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

    const player = client.manager.players.get(interaction.guild.id);
    const song = player.queue.current;
    if (!player.queue.current) {
      let thing = new EmbedBuilder().setColor('Red').setDescription(i18next.t('fnomusic'));
      return interaction.editReply({ embeds: [thing] });
    }

    const emojimusic = client.emoji.music;
    var total = song.length;
    var current = player.position;

    let embed = new EmbedBuilder()
      .setDescription(i18next.t(`nowplaying`, { emojimusic: `${emojimusic}`, songtitle: `${song.title}`, songuri: `${song.uri}` }))
      .addFields([
        {
          name: i18next.t('nowplayingduration'),
          value: `\`[ ${convertTime(total)} ]\``,
          inline: true,
        },
        {
          name: i18next.t('nowplayingauthor'),
          value: `${player.queue.current.author}`,
          inline: true,
        },
        {
          name: i18next.t('nowplayingrequested'),
          value: `[ ${song.requester} ]`,
          inline: true,
        },
        {
          name: i18next.t('nowplayingprogress'),
          value: `** ${progressbar(player)} **  \n\`${convertTime(current)} / ${convertTime(total)}\``,
          inline: true,
        },
      ])

      .setThumbnail(
        `${
          player.queue.current.thumbnail
            ? player.queue.current.thumbnail
            : `https://img.youtube.com/vi/${player.queue.current.identifier}/hqdefault.jpg`
        }`,
      )
      .setColor(client.embedColor);
    return interaction.editReply({ embeds: [embed] });
  },
};
