import db from '../../schema/autoReconnect';

export default {
    name: "ready",
    run: async (client, name) => {
        client.logger.log(`Lavalink "${name}" подключён.`, "ready");
        client.logger.log("Автоматическое повторное подключение, собирающее данные плеера в режиме 24/7", "log");
        const maindata = await db.find()
        client.logger.log(`Найдено автоматическое повторное подключение ${maindata.length ? `${maindata.length} очередь${maindata.length > 1 ? 's' : ''}. Возобновление всей очереди` : '0 очередь'}`, "ready");
        for (let data of maindata) {
            const index = maindata.indexOf(data);
            setTimeout(async () => {
                const channel = client.channels.cache.get(data.TextId)
                const voice = client.channels.cache.get(data.VoiceId)
                if (!channel || !voice) return data.delete()
                await client.manager.createPlayer({
                    guildId: data.Guild,
                    voiceId: data.VoiceId,
                    textId: data.TextId,
                    deaf: true,
                  });
                }
            ), index * 5000}
    }
};