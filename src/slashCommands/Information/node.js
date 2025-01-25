import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'node',
  description: 'Проверка nodes. / Checking nodes.',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],

  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction) => {
        // Проверяет установлен ли язык на сервере Discord
        await checkServerLanguage(interaction.guildId);

  const all = [...client.manager.shoukaku.nodes.values()].map(node => 
        i18next.t(`node`, { nodename: `${node.name}`}) +
        i18next.t(`nodeuptime`, { nodestatsuptime: `${new Date(node.stats.uptime).toISOString().slice(11, 19)}`}) +
        i18next.t(`nodememory`) +
        i18next.t(`nodereservable`, { mathround: `${Math.round(node.stats.memory.reservable / 1024 / 1024)}MB`}) +
        i18next.t(`nodeusedmemory`, { mathround1: `${Math.round(node.stats.memory.used / 1024 / 1024)}MB`}) +
        i18next.t(`nodefreememory`, { mathround2: `${Math.round(node.stats.memory.free / 1024 / 1024)}MB`}) +
        i18next.t(`nodeallocatedmemory`, { mathround3: `${Math.round(node.stats.memory.allocated / 1024 / 1024)}MB`}) + 
        i18next.t(`nodecpu`) +
        i18next.t(`nodecore`, { statscpucores: `${node.stats.cpu.cores}`}) +
        i18next.t(`nodesysload`, { cpusystemload: `${(Math.round(node.stats.cpu.systemLoad * 100) / 100).toFixed(2)}%`}) +
        i18next.t(`nodelavaload`, { cpulavalinkLoad:  `${(Math.round(node.stats.cpu.lavalinkLoad * 100) / 100).toFixed(2)}%`})
    ).join('\n\n----------------------------\n');
    
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Lavalink', iconURL: client.user.displayAvatarURL()})
        .setDescription(`\`\`\`${all}\`\`\``)
        .setColor(client.embedColor)
    interaction.reply({embeds: [embed]})

  },
};  
