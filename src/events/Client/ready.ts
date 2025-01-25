import { ActivityType } from 'discord.js';
import { JuroCord } from '../../structures/JuroCord.js';
import { logBotInfo, noun } from '../../utils/utils';

export default {
name: "ready",
run: async (client: JuroCord) => {
    logBotInfo(client.user.username, "онлайн!")
        //client.logger.log(`${client.user.username} онлайн!`, "ready");
    logBotInfo("Готово", client.guilds.cache.size, `${noun(client.guilds.cache.size, "сервер", "сервера", "серверов")} и`, client.users.cache.size, noun(client.users.cache.size, "пользователь", "пользователя", "пользователей"))
        //client.logger.log(`Готово ${client.guilds.cache.size} серверов, всего ${client.users.cache.size} пользователей`, "ready");

    let statuses = ['/play | INZEWORLD.COM | /help', 'JuroCord Discord', 'SAVIK.INZEWORLD.COM', 'JURO.INZEWORLD.COM'];
    setInterval(function() {
        let status = statuses[Math.floor(Math.random() * statuses.length)];		
            client.user.setPresence({
                activities: [
                    {
                        name: status,
                        type: ActivityType.Watching
                    }
                ],
                status: "idle"
            });
        }, 10000)
    }
};