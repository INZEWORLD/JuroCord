import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'party',
  description: 'Pежим вечеринки. / Set party mode.',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  player: true,
  dj: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  options: [
    {
      name: 'input',
      description: 'Input data "Filters" (on or off).',
      type: 3,
      required: true,
      choices: [
        {
          name: 'on',
          value: 'on',
        },
        {
          name: 'off',
          value: 'off',
        },
      ],
    },
  ],

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: false,
    });
    // Проверяет установлен ли язык на сервере Discord
    await checkServerLanguage(interaction.guildId);

    const input = interaction.options.getString('input');
    const player = client.manager.players.get(interaction.guild.id);
    if (!player.queue.current) {
      let thing = new EmbedBuilder().setColor('Red').setDescription(i18next.t('fnomusic'));
      return interaction.editReply({ embeds: [thing] });
    }
    const emojiequalizer = interaction.client.emoji.filter;
    if (input === 'off') {
      await player.shoukaku.clearFilters();
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t(`fpartyoff`, { emojiequalizer: `${emojiequalizer}`})),
        ],
      });
    } else if (input === 'on') {
      await player.shoukaku.setFilters({
        op: 'filters',
        guildId: interaction.guild.id,
        equalizer: [
          { band: 0, gain: -1.16 },
          { band: 1, gain: 0.28 },
          { band: 2, gain: 0.42 },
          { band: 3, gain: 0.5 },
          { band: 4, gain: 0.36 },
          { band: 5, gain: 0 },
          { band: 6, gain: -0.3 },
          { band: 7, gain: -0.21 },
          { band: 8, gain: -0.21 },
        ],
      });
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t(`fpartyon`, { emojiequalizer: `${emojiequalizer}`})),
        ],
      });
    }
  },
};
