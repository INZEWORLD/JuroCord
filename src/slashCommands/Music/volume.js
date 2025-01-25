import { CommandInteraction, Client, EmbedBuilder } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'volume',
  description: 'Изменяет громкость музыки. / Changes the music volume.',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  player: true,
  dj: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  options: [
    {
      name: 'number',
      description: 'volume  < 0 - 10000 > ',
      required: true,
      type: 10,
    },
  ],

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

    const emojivolume = client.emoji.volumehigh;

    const vol = interaction.options.getNumber('number');

    const player = client.manager.players.get(interaction.guildId);
    if (!player.queue.current) {
      let thing = new EmbedBuilder().setColor('Red').setDescription(i18next.t('fnomusic'));
      return interaction.editReply({ embeds: [thing] });
    }
    const volume = Number(vol);
    if (!volume || volume < 0 || volume > 10000)
      return await interaction
        .editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.embedColor)
              .setDescription(i18next.t(`volumwpremer`)),
          ],
        })
        .catch(() => {});
    await player.setVolume(volume / 1);
    if (volume > player.volume)
      return await interaction
        .editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.embedColor)
              .setDescription(i18next.t(`volume`, { emojivolume: `${emojivolume}`, volume: `${volume}`})),
          ],
        })
        .catch(() => {});
    else if (volume < player.volume)
      return await interaction
        .editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.embedColor)
              .setDescription(i18next.t(`volume`, { emojivolume: `${emojivolume}`, volume: `${volume}`})),
          ],
        })
        .catch(() => {});
    else
      await interaction
        .editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.embedColor)
              .setDescription(i18next.t(`volume`, { emojivolume: `${emojivolume}`, volume: `${volume}`})),
          ],
        })
        .catch(() => {});
  },
};
