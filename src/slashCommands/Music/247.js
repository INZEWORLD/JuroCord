import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import db from '../../schema/autoReconnect';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
    name: '247',
    description: 'Подключается к голосовому каналу 24/7. / Joins voice channel 24/7.',
    userPrams: [],
    botPrams: ['EMBED_LINKS'],
    player: true,
    dj: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */

    run: async (client, interaction) => {
       await interaction.deferReply({
        ephemeral: false,
       });
     // Проверяет установлен ли язык на сервере Discord
      await checkServerLanguage(interaction.guildId);

        const player = client.manager.players.get(interaction.guild.id);

        let data = await db.findOne({Guild: interaction.guild.id})
        if (data) {
            await data.delete();
            let thing = new EmbedBuilder()
                .setColor(client.embedColor)
                .setDescription(i18next.t(`247off`));
            interaction.editReply({ embeds: [thing] })
        } else {
            data = new db({
                Guild: player.guildId,
                TextId: player.textId,
                VoiceId: player.voiceId
            })
            await data.save();
            let thing = new EmbedBuilder()
                .setColor(client.embedColor)
                .setDescription(i18next.t(`247on`));
            interaction.editReply({ embeds: [thing] })
        }

    }
};