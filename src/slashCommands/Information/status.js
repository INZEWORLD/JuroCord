import { EmbedBuilder, version } from 'discord.js';
import os from 'os';
import cpuStat from 'cpu-stat';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'status',
  description: 'Cтатус бота / Show bot status',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  run: async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: false,
    });
    // Проверяет установлен ли язык на сервере Discord
    await checkServerLanguage(interaction.guildId);

    let uptime = await os.uptime();

    let d = Math.floor(uptime / (3600 * 24));
    let h = Math.floor(uptime % (3600 * 24) / 3600);
    let m = Math.floor(uptime % 3600 / 60);
    let s = Math.floor(uptime % 60);
    let dDisplay = d > 0 ? d + (d === 1 ? i18next.t('status.day') + ", " : i18next.t('status.days') + ", ") : "";
    let hDisplay = h > 0 ? h + (h === 1 ? i18next.t('status.hour') + ", " : i18next.t('status.hours') + ", ") : "";
    let mDisplay = m > 0 ? m + (m === 1 ? i18next.t('status.minute') + ", " : i18next.t('status.minutes') + ", ") : "";
    let sDisplay = s > 0 ? s + (s === 1 ? i18next.t('status.second') : i18next.t('status.seconds')) : "";
    let ccount = client.channels.cache.size;
    let scount = client.guilds.cache.size;
    let mcount = 0;
    client.guilds.cache.forEach((guild) => {
      mcount += guild.memberCount;
    });
    cpuStat.usagePercent(function (err, percent, seconds) {
      if (err) {
        return console.log(err);
      }
      const embed = new EmbedBuilder()
        .setDescription(i18next.t('status.title', { client: client }))
        .setThumbnail(client.user.displayAvatarURL())
        .addFields([
          {
            name: i18next.t('status.client.name'),
            value: i18next.t('status.client.value', {
              scount: scount,
              ccount: ccount,
              mcount: mcount,
            }),
            inline: false,
          },
          {
            name: i18next.t('status.cpu.name'),
            value: i18next.t('status.cpu.value', {
              cpuModel: os.cpus().map((i) => i.model)[0], 
              cpuLoad: percent.toFixed(2),
              cpuPlatform: os.platform(),
            }),
            inline: false,
          },
          {
            name: i18next.t('status.disk.name'),
            value: i18next.t('status.disk.value', {
              diskUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
              diskTotal: (os.totalmem() / 1024 / 1024).toFixed(2),
            }),
            inline: false,
          },
          {
            name: i18next.t('status.discord.name'),
            value: i18next.t('status.discord.value', {
              discordjsVersion: version,
              nodeVersion: process.version,
              ping: Math.round(client.ws.ping),
            }),
            inline: false,
          },
          {
            name: i18next.t('status.system.name'),
            value: i18next.t('status.system.value', {
              uptime: dDisplay + hDisplay + mDisplay + sDisplay,
            }),
            inline: true,
          },
        ])
        .setColor(client.embedColor)
        .setTimestamp(Date.now());
      interaction.editReply({ embeds: [embed] });
    });
  },
};
