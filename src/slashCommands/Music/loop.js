import { CommandInteraction, Client, EmbedBuilder } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'loop',
  description: 'Переключить цикл трека / Switch music loop',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  dj: true,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  options: [
    {
      name: 'input',
      description: 'Tone loops input (track, queue or off).',
      type: 3,
      required: true,
      choices: [
        {
          name: 'track',
          value: 'track',
        },
        {
          name: 'queue',
          value: 'queue',
        },
        {
          name: 'off',
          value: 'off',
        },
      ],
    },
  ],
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction) => {
    if (!interaction.replied) await interaction.deferReply().catch(() => {});
              // Проверяет установлен ли язык на сервере Discord
              await checkServerLanguage(interaction.guildId);

    const input = interaction.options.getString('input');

    let player = client.manager.players.get(interaction.guildId);
    if (!player.queue.current) {
      let thing = new EmbedBuilder().setColor('Red').setDescription(i18next.t('fnomusic'));
      return message.channel.send({ embeds: [thing] });
    }
    const emojiloop = client.emoji.loop;

    if (input === 'track') {
      await player.setLoop('track');
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t(`loopon`, { emojiloop: `${emojiloop}`})),
        ],
      });
    } else if (input === 'queue') {
      await player.setLoop('queue');
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t(`loopqueueon`, { emojiloop: `${emojiloop}`})),
        ],
      });
    } else if (input === 'off') {
      await player.setLoop('none');
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t(`loopoff`, { emojiloop: `${emojiloop}`})),
        ],
      });
    }
  },
};
