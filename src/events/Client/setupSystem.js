import { Client, Message, PermissionFlagsBits } from 'discord.js';
import { playerhandler, oops } from '../../utils/functions';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
    name: "setupSystem",

    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     */

    run: async (client, message) => {
   
      // Проверяет установлен ли язык на сервере Discord
      await checkServerLanguage(message.guildId);

        if(!message.member.voice.channel) {
            await oops(message.channel, i18next.t(`ssetupvc`), client.embedColor);
            if(message) await message.delete().catch(() => {});
            return;
        };

        if(!message.member.voice.channel.permissionsFor(client.user).has([PermissionFlagsBits.Connect, PermissionFlagsBits.Speak])) {
            await oops(message.channel, i18next.t(`svoicechannelparm`,  { svoicechannel: `${message.member.voice.channel}`}));
            if(message) await message.delete().catch(() => {});
            return;
        };

        if(message.guild.members.me.voice.channel && message.guild.members.me.voice.channelId !== message.member.voice.channelId) {
            await oops(message.channel, i18next.t(`snoconnectvc`, { svoicechannelId: `${message.guild.members.me.voice.channelId}`}));
            if(message) await message.delete().catch(() => {});
            return;
        };

        let player = client.manager.players.get(message.guildId);
        
        if(!player) player = await client.manager.createPlayer({
            guildId: message.guild.id,
            voiceId: message.member.voice.channel.id,
            textId: message.channel.id,
            deaf: true,
          });

        await playerhandler(message.content, player, message);
        if(message) await message.delete().catch(() => {});
    }
};