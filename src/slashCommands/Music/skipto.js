import { CommandInteraction, Client, EmbedBuilder } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'skipto',
  description: 'Перейти к определенной песне в очереди / Jump to a specific song in queue',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  player: true,
  dj: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  options: [
    {
      name: 'number',
      description: 'Go to song <sequence number>',
      required: true,
      type: 10, 
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

    const position = interaction.options.getNumber('number');
    const player = client.manager.players.get(interaction.guildId);

    if (!player.queue.current) {
      let thing = new EmbedBuilder().setColor('Red').setDescription(i18next.t('fnomusic'));
      return await interaction.editReply({ embeds: [thing] });
    }

    if (!position || position < 1 || position > player.queue.size) {
      let thing = new EmbedBuilder()
        .setColor('Red')
        .setDescription(i18next.t(`skiptopremer`));
      return await interaction.editReply({ embeds: [thing] });
    }

    player.queue.splice(0, position - 1);
    await player.skip();

    const emojijump = client.emoji.jump;

    let thing = new EmbedBuilder()
      .setDescription(i18next.t(`skipto`, { emojijump: `${emojijump}`, position: `${position}`}))
      .setColor(client.embedColor);
    return await interaction.editReply({ embeds: [thing] });
  },
};
