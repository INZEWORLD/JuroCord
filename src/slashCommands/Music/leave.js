import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'leave',
  description: 'Выходит из голосового канала / Leave the voice channel',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  dj: true,
  player: false,
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

    const emojiLeave = interaction.client.emoji.leave;

    await player.destroy(interaction.guild.id);

    let thing = new EmbedBuilder()
      .setColor(interaction.client.embedColor)
      .setDescription(i18next.t(`leave`, { emojiLeave: `${emojiLeave}`}));
    return interaction.editReply({ embeds: [thing] });
  },
};
