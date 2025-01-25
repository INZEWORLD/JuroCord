import { CommandInteraction, Client, EmbedBuilder } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'remove',
  description: 'Удалить песню из очереди / Remove a song from the queue',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  dj: true,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  options: [
    {
      name: 'number',
      description: 'Количество песен в очереди / Number of songs in queue',
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

    const player = client.manager.players.get(interaction.guild.id);

    if (!player.queue.current) {
      let thing = new EmbedBuilder().setColor('Red').setDescription(i18next.t('fnomusic'));
      return interaction.editReply({ embeds: [thing] });
    }

    const pos = interaction.options.getNumber("number");
    const position = Number(pos) - 1;
    if (position > player.queue.length) {
      const number = position + 1;
      let thing = new EmbedBuilder()
        .setColor('Red')
        .setDescription(i18next.t(`remove`, { number: `${number}`, playerqueuelength: `${player.queue.length}`}));
      return interaction.editReply({ embeds: [thing] });
    }

    const song = player.queue[position];

    await player.queue.splice(position, 1);

    const emojieject = client.emoji.remove;

    let thing = new EmbedBuilder()
      .setColor(client.embedColor)
      .setDescription(i18next.t(`removedel`, { emojieject: `${emojieject}`, songtitle: `${song.title}`, songuri: `${song.uri}`}));
    return interaction.editReply({ embeds: [thing] });
  },
};
