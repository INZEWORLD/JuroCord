import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'forceskip',
  description: 'Принудительно пропустить песню. / To force skip the currently playing song.',
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
    if (!player || !player.queue.current) {
      let thing = new EmbedBuilder().setColor('Red').setDescription(i18next.t('fnomusic'));
      return interaction.editReply({ embeds: [thing] });
    }
    const song = player.queue.current;
    await player.skip();
    const emojiskip = interaction.client.emoji.skip;
    let thing = new EmbedBuilder()
      .setDescription(i18next.t(`forceskip`, { emojiskip: `${emojiskip}`, songtitle: `${song.title}`, songuri: `${song.uri}`}))
      .setColor(client.embedColor);
    return interaction.editReply({ embeds: [thing] });
  },
};
