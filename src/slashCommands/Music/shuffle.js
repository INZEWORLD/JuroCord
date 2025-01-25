import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'shuffle',
  description: 'Перемешать очередь / Shuffle queue',
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

    if (!player.queue.current) {
      let thing = new EmbedBuilder().setColor('Red').setDescription(i18next.t('fnomusic'));
      return interaction.editReply({ embeds: [thing] });
    }
    const emojishuffle = client.emoji.shuffle;

    let thing = new EmbedBuilder()
      .setDescription(i18next.t(`shuffle`, { emojishuffle: `${emojishuffle}`}))
      .setColor(client.embedColor);
    await player.queue.shuffle();
    return interaction
      .editReply({ embeds: [thing] })
      .catch((error) => client.logger.log(error, 'ошибка'));
  },
};
