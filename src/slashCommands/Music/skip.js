import { CommandInteraction, Client, EmbedBuilder } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'skip',
  description: 'Пропустить песню / To skip a song',
  player: true,
  dj: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,

  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String} color
   */

  run: async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: false,
    });
    // Проверяет установлен ли язык на сервере Discord
    await checkServerLanguage(interaction.guildId);

    const player = client.manager.players.get(interaction.guild.id);

    if (!player.queue.current) {
      let thing = new EmbedBuilder().setColor('RED').setDescription(i18next.t('fnomusic'));
      return interaction.editReply({ embeds: [thing] });
    }
     if (player.queue.length == 0) {
      let noskip = new EmbedBuilder()
        .setColor(client.embedColor)
        .setDescription(i18next.t(`skipno`));
    return interaction.editReply({ embeds: [noskip] });
    }

    await player.skip();

    const emojiskip = client.emoji.skip;

    let thing = new EmbedBuilder()
      .setDescription(i18next.t(`skip`, { emojiskip: `${emojiskip}`, playerqueuecurrenttitle: `${player.queue.current.title}`, playerqueuecurrenturi: `${player.queue.current.uri}`}))
      .setColor(client.embedColor);
    return interaction.editReply({ embeds: [thing] });
  },
};
