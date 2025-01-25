import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'pause',
  description: 'Приостановить музыку / Pause current music',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  dj: true,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  async run(client, interaction) {
    await interaction.deferReply({
      ephemeral: false,
    });
    // Проверяет установлен ли язык на сервере Discord
    await checkServerLanguage(interaction.guildId);

    const player = client.manager.players.get(interaction.guildId);

    if (!player.queue.current) {
      let thing = new EmbedBuilder().setColor('Red').setDescription(i18next.t('fnomusic'));
      return interaction.editReply({ embeds: [thing] });
    }

    const emojipause = client.emoji.pause;

    if (player.paused) {
      let thing = new EmbedBuilder()
        .setColor('Red')
        .setDescription(i18next.t(`pausewarn`, { emojipause: `${emojipause}`})); ///////////////
      return interaction.editReply({ embeds: [thing] });
    }

    await player.pause(true);

    const song = player.queue.current;

    let thing = new EmbedBuilder()
      .setColor(client.embedColor)
      .setDescription(i18next.t(`pause`, { emojipause: `${emojipause}`, songtitle: `${song.title}`, songuri: `${song.uri}`})); //////////////////
    return interaction.editReply({ embeds: [thing] });
  }
}