import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import db from '../../schema/setup';
import db2 from '../../schema/autoReconnect';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
    name: "playerDestroy",
    run: async (client, player) => {
    // Проверяет установлен ли язык на сервере Discord
    await checkServerLanguage(player.guildId);

        let name = client.guilds.cache.get(player.guildId).name;

        client.logger.log(`JuroCord Закончил играть трек на сервере ${name} [ ${player.guildId} ]`, "log");

        if (player.data.get('message') && player.data.get('message').deletable ) player.data.get('message').delete().catch(() => null);

        if (player.data.get("autoplay")) try { player.data.delete("autoplay") } catch (err) { client.logger.log(err.stack ? err.stack : err, "log") };

        let guild = client.guilds.cache.get(player.guildId);
        if (!guild) return;
        const data = await db.findOne({ Guild: guild.id });
        if (!data) return;

        let channel = guild.channels.cache.get(data.Channel);
        if (!channel) return;

        let message;

        try {

            message = await channel.messages.fetch(data.Message, { cache: true });

        } catch (e) { };

        if (!message) return;
        let disabled = true;
        if (player && player.queue && player.queue.current) disabled = false;
        let embed1 = new EmbedBuilder()
        .setColor(client.embedColor)
        .setTitle(i18next.t(`pdestorytitle`))
        .setDescription(i18next.t(`pdescription`, { linksinvite: `${client.config.links.invite}`, linkssupport: `${client.config.links.support}`}))
        .setImage(client.config.links.bg);
        const but1 = new ButtonBuilder().setCustomId(`${message.guildId}pause`).setEmoji(`⏸️`).setStyle(2).setDisabled(disabled)
        const but2 = new ButtonBuilder().setCustomId(`${message.guildId}previous`).setEmoji(`⏮️`).setStyle(2).setDisabled(disabled)
        const but3 = new ButtonBuilder().setCustomId(`${message.guildId}skip`).setEmoji(`⏭️`).setStyle(2).setDisabled(disabled)
        const but6 = new ButtonBuilder().setCustomId(`${message.guildId}stop`).setEmoji(`⏹️`).setStyle(2).setDisabled(disabled)
        const but7 = new ButtonBuilder().setCustomId(`${message.guildId}loop`).setEmoji(`🔁`).setStyle(2).setDisabled(disabled)

        const row = new ActionRowBuilder().addComponents(but2, but6, but1, but7, but3)
        
        await message.edit({
            content: i18next.t(`pcreate`),
            embeds: [embed1],
            components: [row]
        });
        const vc = await db2.findOne({Guild: player.guildId})
        if(vc) await client.manager.createPlayer({
            guildId: vc.Guild,
            voiceId: vc.VoiceId,
            textId: vc.TextId,
            deaf: true,
          });
    }

};
