import { VoiceState, TextChannel, EmbedBuilder, ChannelType } from 'discord.js';
import { KazagumoPlayer, PlayerState } from 'kazagumo';
import { JuroCord } from '../../structures/JuroCord';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
    name: "voiceStateUpdate",
    run: async (client: JuroCord, oldState: VoiceState, newState: VoiceState) => {
        try {
            const guildId = newState.guild.id;
            // Проверяем язык сервера Discord
            await checkServerLanguage(guildId);

            const player = client.manager.players.get(guildId);

            if (!player) return;

            // Проверяем, отключен ли бот
            if (!newState.guild.members.cache.get(client.user?.id)?.voice.channelId) {
                const textChannelId = player.textId;
                const voiceChannelId = oldState.channelId;

                // Убеждаемся, что плеер не уничтожен и не находится в процессе уничтожения
                if (player.state !== PlayerState.DESTROYED && player.state !== PlayerState.DESTROYING) {
                    const emb = new EmbedBuilder()
                        .setColor(client.embedColor)
                        .setDescription(i18next.t('disconnect'));
                    const textChannel = client.channels.cache.get(textChannelId) as TextChannel;

                    // Отправляем сообщение об отключении
                    await textChannel.send({ embeds: [emb] }).then(msg =>
                        setTimeout(() => msg.delete(), 5000)
                    );

                    // Пытаемся повторно подключиться к голосовому каналу
                    if (voiceChannelId) {
                        const channel = client.channels.cache.get(voiceChannelId);
                        if (channel && channel.type === ChannelType.GuildVoice) {
                            try {
                                if (player.state !== PlayerState.CONNECTED) {
                                    player.setVoiceChannel(channel.id);
                                    player.connect();
                                } else {
                              }
                            } catch (error) {
                                if (error.code === 1) {
                                } else {
                                    throw error;
                                }
                            }
                        }
                    }

                    // Если был играющий трек, пытаемся возобновить воспроизведение
                    if (player.queue.current) {
                        // Сохраняем текущее время трека
                        const currentPosition = player.position;

                        // Используем метод seek для возврата к текущей позиции
                        await player.play(player.queue.current);
                        await player.seek(currentPosition);
                    }
                }
            }
        } catch (error) {
            if (error.code === 1) {
                console.log('Плеер уже подключен к голосовому каналу.');
            } else {
                console.error('Ошибка в событии voiceStateUpdate:', error);
            }
        }
    }
};
