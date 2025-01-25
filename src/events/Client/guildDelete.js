import { EmbedBuilder } from 'discord.js';
import moment from 'moment';

export default {
  name: "guildDelete",
  run: async (client, guild) => {
    const channel = client.channels.cache.get(client.config.logs);
    let own = await guild?.fetchOwner()

    if (channel) {

      const embed = new EmbedBuilder()
        .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
        .setTitle(`📤 Я покинул гильдию !!`)
        .addFields([
          { name: 'Name', value: `\`${guild.name}\`` },
          { name: 'ID', value: `\`${guild.id}\`` },
          { name: 'Владелец', value: `\`${guild.members.cache.get(own.id) ? guild.members.cache.get(own.id).user.tag : "Unknown user"} [ ${own.id} ]\`` },
          { name: 'Количество участников', value: `\`${guild.memberCount}\` Members` },
          { name: 'Дата создания', value: `\`${moment.utc(guild.createdAt).format('DD/MMM/YYYY')}\`` },
          { name: `${client.user.username}'Количество серверов`, value: `\`${client.guilds.cache.size}\` Severs` }
        ])
        .setColor(client.embedColor)
        .setTimestamp()
      channel.send({ embeds: [embed] });

    }
  }
};