import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import { promisify } from "util"
const Wait = promisify(setTimeout);
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'stop',
  description: 'Останавливает музыку / Stops the music',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  player: true,
  dj: true,
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
    if (!player.queue.current) {
      let thing = new EmbedBuilder().setColor('Red').setDescription(i18next.t('fnomusic'));
      return interaction.editReply({ embeds: [thing] });
    }

    player.queue.clear();
    player.data.delete("autoplay")
    player.loop = 'none';
    player.playing = false;
    player.paused = false;
    await player.skip();
    Wait(500);
    const emojistop = client.emoji.stop;
    let thing = new EmbedBuilder()
      .setColor(client.embedColor)
      .setDescription(i18next.t(`stop`, { emojistop: `${emojistop}`}));
    interaction.editReply({ embeds: [thing] });
  },
};
