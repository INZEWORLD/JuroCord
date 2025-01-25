import { EmbedBuilder, CommandInteraction, ApplicationCommandOptionType, Colors, ChatInputCommandInteraction } from 'discord.js';
import { JuroCord } from "../../structures/JuroCord.js";
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: '8d',
  description: 'Устанавливает фильтр 8d. / Sets the filter 8d.',
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

  run: async (client : JuroCord, interaction : ChatInputCommandInteraction) => {

    await interaction.deferReply({
      ephemeral: false,
    });
          // Проверяет установлен ли язык на сервере Discord
          await checkServerLanguage(interaction.guildId);

    const input = interaction.options.getString('input');
    const player = client.manager.players.get(interaction.guild.id);
    if (!player.queue.current) {
      let thing = new EmbedBuilder().setColor(Colors.Red).setDescription(i18next.t('fnomusic'));
      return interaction.editReply({ embeds: [thing] });
    }
    const emojiequalizer = client.emoji.filter;
    if (input === 'off') {
      await player.shoukaku.clearFilters();
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t(`f8doff`, { emojiequalizer: `${emojiequalizer}`}))
        ],
      });
    } else if (input === 'on') {
      await player.shoukaku.setFilters({
        // op: 'filters',
        // guildId: interaction.guild.id,
        rotation: { rotationHz: 0.2 },
      });
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t(`f8don`, { emojiequalizer: `${emojiequalizer}`}))
        ],
      });
    }
  },
};
