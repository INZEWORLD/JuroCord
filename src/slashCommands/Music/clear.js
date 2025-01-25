import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'clear',
  description: 'Очистить очередь / Clear queue',
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
    if (!player.queue[0]) {
      let thing = new EmbedBuilder()
        .setColor('Red')
        .setDescription(i18next.t('noclear'));
      return interaction.editReply({ embeds: [thing] });
    }
  
    await player.queue.clear();

    const embed = new EmbedBuilder()
      .setColor(client.embedColor)
      .setDescription(i18next.t(`clear`));
    await interaction.editReply({ embeds: [embed] });
  },
};
