import { EmbedBuilder, Client } from 'discord.js';
import { trackStartEventHandler } from '../../utils/functions';
import db from '../../schema/setup';
import { KazagumoPlayer, KazagumoTrack } from 'kazagumo';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

// Определение функции convertTime
function convertTime(length) {
    const minutes = Math.floor(length / 60000);
    const seconds = ((length % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export default {
    name: "playerStart",
    /**
     * @param {Client} client 
     * @param {KazagumoPlayer} player 
     * @param {KazagumoTrack} track 
     */
    run: async (client, player, track) => {
        await checkServerLanguage(player.guildId);
        let guild = client.guilds.cache.get(player.guildId);
        if (!guild) return;

        let channel = guild.channels.cache.get(player.textId);
        if (!channel) return;

        let data = await db.findOne({ Guild: guild.id });

        if (data && data.Channel) {
            let textChannel = guild.channels.cache.get(data.Channel);
            const id = data.Message;
            if (channel === textChannel) {
                return await trackStartEventHandler(id, textChannel, player, track, client);
            } else {
                await trackStartEventHandler(id, textChannel, player, track, client);
            }
        }
        const song = player.queue.current;
        const emojiplay = client.emoji.play;
        const thumbnailUrl = track.thumbnail ? track.thumbnail : `https://img.youtube.com/vi/${track.identifier}/hqdefault.jpg`;
        // Проверяет установлен ли язык на сервере Discord
        const main = new EmbedBuilder()
            .setTitle(i18next.t(`pplay`, { emojiplay: `${emojiplay}`}))
            .setDescription(`[${track.title}](${track.uri})`)
            .setColor(client.embedColor)
            .setTimestamp()
            .setThumbnail(thumbnailUrl)
            .addFields([
                {
                    name: i18next.t(`pqueue`),
                    value: `\`${track.isStream ? '◉ LIVE' : convertTime(player.queue.current.length)}\``,
                    inline: true,
                },
                {
                    name: i18next.t(`pauthor`),
                    value: `${track.author}`,
                    inline: true,
                },
                {
                    name: i18next.t(`parequest`),
                    value: `[ ${song.requester} ]`,
                    inline: true,
                },
            ]);

        client.channels.cache.get(player.textId)?.send({ embeds: [main] }).then(x => player.data.set("message", x));

        await player.data.set("autoplaySystem", track.identifier);
    }
};
