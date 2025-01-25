import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'resume',
  description: 'Возобновить музыку / Resume music',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  dj: true,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,

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

    const emojiresume = client.emoji.resume;

    if (!player.paused) {
      let thing = new EmbedBuilder()
        .setColor('Red')
        .setDescription(i18next.t(`resume`, { emojiresume: `${emojiresume}`}));
      return interaction.editReply({ embeds: [thing] });
    }

    await player.pause(false);

    let thing = new EmbedBuilder()
      .setDescription(i18next.t(`resumep`, { emojiresume: `${emojiresume}`, songtitle: `${song.title}`, songuri: `${song.uri}`}))
      .setColor(client.embedColor);
    return interaction.editReply({ embeds: [thing] });
  },
};
