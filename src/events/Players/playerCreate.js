import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, Client } from 'discord.js';
import db from '../../schema/setup';
import { KazagumoPlayer } from 'kazagumo';
import { checkServerLanguage} from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'playerCreate',

  /**
   *
   * @param {Client} client
   * @param {KazagumoPlayer} player
   */

  run: async (client, player) => {


    let name = client.guilds.cache.get(player.guildId).name;

    client.logger.log(`Пользователь включил трек на сервере ${name} [ ${player.guildId} ]`, 'log');

    let guild = client.guilds.cache.get(player.guildId);
    if (!guild) return;

    const data = await db.findOne({ Guild: guild.id });
    if (!data) return;

    let channel = guild.channels.cache.get(data.Channel);
    if (!channel) return;

    let message;
    try {
      message = await channel.messages.fetch(data.Message, { cache: true });
    } catch (e) {}

    if (!message) return;

    const but1 = new ButtonBuilder().setCustomId(`${message.guildId}pause`).setEmoji('⏸️').setStyle(2).setDisabled(false);
    const but2 = new ButtonBuilder().setCustomId(`${message.guildId}previous`).setEmoji('⏮️').setStyle(2).setDisabled(false);
    const but3 = new ButtonBuilder().setCustomId(`${message.guildId}skip`).setEmoji('⏭️').setStyle(2).setDisabled(false);
    const but6 = new ButtonBuilder().setCustomId(`${message.guildId}stop`).setEmoji('⏹️').setStyle(2).setDisabled(false);
    const but7 = new ButtonBuilder().setCustomId(`${message.guildId}loop`).setEmoji('🔁').setStyle(2).setDisabled(false);

    const row = new ActionRowBuilder().addComponents(but2, but6, but1, but7, but3);
    // Проверяет установлен ли язык на сервере Discord
    await checkServerLanguage(player.guildId);
    await message.edit({
      content:
        i18next.t(`pcreate`),
      components: [row],
    }).catch(() => {});
  },
};
