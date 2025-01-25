import { EmbedBuilder, Client, ButtonInteraction, PermissionFlagsBits } from 'discord.js';
import { convertTime } from '../../utils/convert';
import { buttonReply } from '../../utils/functions';
import db from '../../schema/dj';
import { KazagumoTrack } from 'kazagumo';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';


export default {
    name: "playerButtons",

    /**
     * 
     * @param {Client} client 
     * @param {ButtonInteraction} interaction 
     * @param {*} data 
     */

    run: async (client, interaction, data) => {
        if (!interaction.replied) await interaction.deferReply().catch(() => { });

        // Check the server language
        await checkServerLanguage(interaction.guildId);
        const color = client.embedColor;
        const emojipause = client.emoji.pause;
        const emojistop = client.emoji.stop;
        const emojiresume = client.emoji.resume;
        const emojiskip = client.emoji.skip;
        const emojiloop = client.emoji.loop;
        const previousEmoji = client.emoji.previous;

        let data2 = await db.findOne({ Guild: interaction.guildId });
        let pass = false;
        if (data2) {
            if (data2.Mode) {
                if (data2.Roles.length > 0) {
                    interaction.member.roles.cache.forEach((x) => {
                        let role = data2.Roles.find((r) => r === x.id);
                        if (role) pass = true;
                    });
                };
                if (!pass && !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                    return await buttonReply(interaction, i18next.t(`pdjroleno`), color);
                }
            };
        }

        if (!interaction.member.voice.channel) {
            return await buttonReply(interaction, i18next.t(`pnoconnectbutton`), color);
        }

        if (interaction.guild.members.me.voice.channel && interaction.guild.members.me.voice.channelId !== interaction.member.voice.channelId) {
            return await buttonReply(interaction, i18next.t(`pnouserbutton`, {membersvc: `${interaction.guild.members.me.voice.channel}`}), color);
        }

        const player = client.manager.players.get(interaction.guildId);
        if (!player) {
            return await buttonReply(interaction, i18next.t(`pnoplayer`), color);
        }

        if (!player.queue || !player.queue.current) {
            return await buttonReply(interaction, i18next.t(`pnoplayer`), color);
        }

        let message;
        try {
            message = await interaction.channel.messages.fetch(data.Message, { cache: true });
        } catch (e) { };

        const currentTrack = player.queue.current;
        const requester = currentTrack.requester;
        const requesterTag = requester ? requester.tag : i18next.t(`pnoname`);
        const requesterAvatarURL = requester ? requester.displayAvatarURL({ dynamic: true }) : client.user.displayAvatarURL({ dynamic: true });

        const icon = currentTrack.thumbnail ? currentTrack.thumbnail : `https://img.youtube.com/vi/${currentTrack.identifier}/hqdefault.jpg`;

        let nowPlaying = new EmbedBuilder()
            .setColor(color)
            .setDescription(`[${currentTrack.title}](${currentTrack.uri}) • \`[ ${currentTrack.isStream ? '[**◉ LIVE**]' : convertTime(currentTrack.length)} ]\``)
            .setImage(icon)
            .setFooter({ text: i18next.t(`prequest`, { requestag: `${requesterTag}`}), iconURL: requesterAvatarURL });

        switch (interaction.customId) {
            case `${interaction.guildId}pause`:
                if (player.shoukaku.paused) {
                    await player.pause(false);
                    await buttonReply(interaction, i18next.t(`punpause`, { emojiresume: `${emojiresume}`, currentTrack: `${currentTrack.title}`, currentTrackuri: `${currentTrack.uri}`}), color);
                } else {
                    await player.pause(true);
                    await buttonReply(interaction, i18next.t(`ppause`, { emojipause: `${emojipause}`, currentTrack: `${currentTrack.title}`, currentTrackuri: `${currentTrack.uri}`}), color);
                }
                if (message) {
                    await message.edit({ embeds: [nowPlaying] }).catch(() => { });
                }
                break;

            case `${interaction.guildId}skip`:
                if (player.queue.length === 0) {
                    return await buttonReply(interaction, i18next.t(`pskip`), color);
                }
                await player.skip();
                if (message) {
                    await message.edit({ embeds: [nowPlaying] }).catch(() => { });
                }
                await buttonReply(interaction, i18next.t(`pplayerskip`, { emojiskip: `${emojiskip}`, currentTrack: `${currentTrack.title}`, currentTrackuri: `${currentTrack.uri}`}), color);
                break;

            case `${interaction.guildId}stop`:
                player.queue.clear();
                player.data.delete("autoplay");
                player.loop = 'none';
                player.playing = false;
                player.paused = false;
                await player.skip();
                if (message) {
                    await message.edit({ embeds: [nowPlaying] }).catch(() => { });
                }
                await buttonReply(interaction, i18next.t(`pstop`, { emojistop: `${emojistop}`}), color);
                break;

            case `${interaction.guildId}loop`:
                const currentLoopMode = player.loop;
                if (currentLoopMode === 'queue') {
                    await player.setLoop('none');
                    if (message) {
                        await message.edit({ embeds: [nowPlaying] }).catch(() => { });
                    }
                    await buttonReply(interaction, i18next.t(`ploopon`, { emojiloop: `${emojiloop}`}), color);
                } else {
                    await player.setLoop('queue');
                    if (message) {
                        await message.edit({ embeds: [nowPlaying] }).catch(() => { });
                    }
                    await buttonReply(interaction, i18next.t(`ploop`, { emojiloop: `${emojiloop}`}), color);
                }
                break;

            case `${interaction.guildId}previous`:
                if (!player.queue.previous) {
                    return await buttonReply(interaction, i18next.t(`pprevious`), color);
                }
                const previous = player.getPrevious(); // Получаем предыдущий трек без его удаления
                if (!previous) return await buttonReply(interaction, i18next.t(`pprevious`), color);
                await player.play(player.getPrevious(true)); // Удаляем предыдущий трек и воспроизводим его
                await buttonReply(interaction, i18next.t(`ppreviousplay`, { previousEmoji: `${previousEmoji}`, previoustitle: `${previous.title}`, previousuri: `${previous.uri}`}), color);
                if (message) {
                    await message.edit({ embeds: [nowPlaying] }).catch(() => { });
                }
                break;

            default:
                await buttonReply(interaction, i18next.t(`nonamecmd`), color);
                break;
        }
    }
};
