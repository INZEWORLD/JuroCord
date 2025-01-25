import {
    Message,
    EmbedBuilder,
    Client,
    TextChannel,
    ButtonBuilder,
    ActionRowBuilder,
    GuildMember,
    User,
} from 'discord.js';

import db from '../schema/setup';
import { convertTime } from './convert';
import { KazagumoPlayer, KazagumoTrack } from 'kazagumo';
import { JuroCord } from '../structures/JuroCord';
import { checkServerLanguage } from './checkServerLanguage';
import i18next from 'i18next';

/**
 * 
 * @param {TextChannel} channel 
 * @param {String} args 
 */
export async function oops(channel, args) {
    try {
        let embed1 = new EmbedBuilder().setColor("Red").setDescription(`${args}`);

        const m = await channel.send({
            embeds: [embed1]
        });

        setTimeout(async () => await m.delete().catch(() => { }), 12000);
    } catch (e) {
        return console.error(e)
    }
}
    
      
/**
 * 
 * @param {String} query 
 * @param {KazagumoPlayer} player 
 * @param {Message} message 
 * @param {Client}  client
 */
export function neb(embed, player, client) {
    const config = require("../config")
    let icon = config.links.bg;
     checkServerLanguage(player.guildId);
    return embed.setDescription(`[${player.queue.current.title}](${player.queue.current.uri}) • \`[ ${player.queue.current.isStream ? '[**◉ LIVE**]' : convertTime(player.queue.current.length)} ]\``).setImage(icon).setFooter({ text: i18next.t(`setupprequest`, { setuprequestag: `${player.queue.current.requester.tag}`}), iconURL: player.queue.current.requester.displayAvatarURL({ dynamic: true }) });
}

/**
 * 
 * @param {KazagumoPlayer} player 
 * @param {Client} client
 * @returns 
 */
export async function autoplay(player, client, message) {
    const searched = `https://www.youtube.com/watch?v=${player.data.get("autoplaySystem")}&list=RD${player.data.get("autoplaySystem")}`;
    let requester = player.data.get("requester");
    if (!searched[0]) {
        // FIXME: откуда message???
        return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.embedColor).setDescription(i18next.t(`autoplayerr`))] });
    }
    const { tracks } = await player.search(searched, { requester: requester });
    player.queue.add(tracks[1]);
    player.queue.add(tracks[2]);
    return player.play();
}

const userTrackAddTimestamps = new Map();

/**
 * 
 * @param {String} query 
 * @param {KazagumoPlayer} player 
 * @param {Message} message 
 * @param {Client}  client
 */
export async function playerhandler(query, player, message) {
    let m;
    const emojiaddsong = message.client.emoji.addsong;
    const emojiplaylist = message.client.emoji.playlist;
    let d = await db.findOne({ Guild: message.guildId });
    let n = new EmbedBuilder().setColor(message.client.embedColor);
    checkServerLanguage(player.guildId);
    try {
        if (d) m = await message.channel.messages.fetch(d.Message, { cache: true });
    } catch (e) { };

    if (!message.guild.members.me.voice.channel || player.state !== "CONNECTED") player = await message.client.manager.createPlayer({
        guildId: message.guild.id,
        voiceId: message.member.voice.channel.id,
        textId: message.channel.id,
        deaf: true,
    });

    // Логика предотвращения спама
    const now = Date.now();
    const userId = message.author.id;
    const cooldown = 3500; // 3.5 секунды восстановления
    const maxTracks = 3;

    if (!userTrackAddTimestamps.has(userId)) {
        userTrackAddTimestamps.set(userId, []);
    }

    const userTimestamps = userTrackAddTimestamps.get(userId);
    userTimestamps.push(now);

    // Отфильтруйте временные метки, чтобы сохранить только те, которые находятся в пределах периода восстановления.
    userTrackAddTimestamps.set(userId, userTimestamps.filter(timestamp => now - timestamp < cooldown));

    if (userTrackAddTimestamps.get(userId).length > maxTracks) {
        return message.reply(i18next.t(`playkd`, { maxtracks: `${maxTracks}`, cooldown: `${cooldown / 1000}`}))
            .then((n) => setTimeout(async () => await n.delete().catch(() => { }), 2500))
            .catch(() => { });
    }

    const result = await player.search(query, { requester: message.author });
    if (!result.tracks.length) return message.reply({ content: i18next.t('noresult') }).then((n) => setTimeout(async () => await n.delete().catch(() => { }), 2500)).catch(() => { }); //Таймер удаление 2.5сек.//
    const tracks = result.tracks;
    if (result.type === 'PLAYLIST') for (let track of tracks) player.queue.add(track);
    else player.queue.add(tracks[0]);
    if (!player.playing && !player.paused) await player.play();
    return message.channel.send(
        result.type === 'PLAYLIST'
            ? {
                embeds: [
                    new EmbedBuilder()
                        .setColor(message.client.embedColor)
                        .setDescription(
                            i18next.t(`playplst`, { emojiplaylist: `${emojiplaylist}`, trackslength: `${tracks.length}`, resultplaylistName: `${result.playlistName}`}),
                        ),
                ],
            }: 
            {
                embeds: [
                    new EmbedBuilder()
                        .setColor(message.client.embedColor)
                        .setDescription(i18next.t(`play`, { emojiaddsong: `${emojiaddsong}`, trackstitle: `${tracks[0].title}`, tracksuri: `${tracks[0].uri}`})),
                ],
            },
    ).then((a) => setTimeout(async () => await a.delete().catch(() => { }), 5000)).catch(() => { });

}

/**
 * 
 * @param {String} msgId
 * @param {TextChannel} channel 
 * @param {KazagumoPlayer} player 
 * @param {KazagumoTrack} track 
 * @param {Client} client
 */
 

export async function trackStartEventHandler(msgId: string, channel: TextChannel, player: KazagumoPlayer, track: KazagumoTrack, client: JuroCord) {
    try {
        const icon = `${track.thumbnail ? track.thumbnail : `https://img.youtube.com/vi/${player.queue.current.identifier}/hqdefault.jpg`}` || client.config.links.bg;
        let message = await channel.messages.fetch(msgId).catch((e) => null);
        const requester = track.requester as User
        const title = i18next.t(`pcreate`)
        const announcementEmbed = new EmbedBuilder().setTitle(i18next.t(`setupmusic`)).setColor(client.embedColor).setDescription(`[${track.title}](${track.uri}) - \`[ ${track.isStream ? '[**◉ LIVE**]' : convertTime(player.queue.current.length)} ]\``).setImage(icon).setFooter({ text: i18next.t(`setupprequest`, { setuprequestag: `${requester ? requester.tag : "Noname"}`}), iconURL: requester.displayAvatarURL() });

        if (!message) {
            const but1 = new ButtonBuilder().setCustomId(`${player.guildId}pause`).setEmoji(`⏸️`).setStyle(2)
            const but2 = new ButtonBuilder().setCustomId(`${player.guildId}previous`).setEmoji(`⏮️`).setStyle(2)
            const but3 = new ButtonBuilder().setCustomId(`${player.guildId}skip`).setEmoji(`⏭️`).setStyle(2)
            const but6 = new ButtonBuilder().setCustomId(`${player.guildId}stop`).setEmoji(`⏹️`).setStyle(2)
            const but7 = new ButtonBuilder().setCustomId(`${player.guildId}loop`).setEmoji(`🔁`).setStyle(2)

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents( but2, but6, but1, but7, but3 )

            const announcementMessage = await channel.send({
                content: title,
                embeds: [announcementEmbed],
                components: [row]
            });

            return await db.findOneAndUpdate({ Guild: channel.guild.id }, { Message: announcementMessage.id });
        } else {
            await message.edit({
                content: title,
                embeds: [announcementEmbed]
            });
        };
    } catch (error) {
        return console.error(error);
    }
}
/**
 * 
 * @param {ButtonInteraction} int 
 * @param {String} args 
 * @param {Client} client 
 */

export async function buttonReply(int, args, client) {

    if (int.replied) {
        await int.editReply({ embeds: [new EmbedBuilder().setColor(int.client.embedColor).setAuthor({ name: int.member.user.tag, iconURL: int.member.user.displayAvatarURL() }).setDescription(args)] })
    } else {
        await int.editReply({ embeds: [new EmbedBuilder().setColor(int.client.embedColor).setAuthor({ name: int.member.user.tag, iconURL: int.member.user.displayAvatarURL() }).setDescription(args)] })
    };

    setTimeout(async () => {
        if (int && !int.ephemeral) {
            await int.deleteReply().catch(() => { });
        };
    }, 2000);
}
