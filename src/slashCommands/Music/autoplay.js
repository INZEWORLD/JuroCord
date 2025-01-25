import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
    name: "autoplay",
    description: "Включить автоплей музыки / Enable autoplay music",
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
        const emojireplay = client.emoji.autoplay;
        player.data.set("autoplay", !player.data.get("autoplay"));
        player.data.set("requester", interaction.user);
        let thing = new EmbedBuilder()
            .setColor(client.embedColor)
            .setTimestamp()
            .setDescription(i18next.t(`autoplay`, { emojireplay: `${emojireplay}`,  playerdataget: `${player.data.get("autoplay") ? "**ON**" : "**OFF**"}.`}))
        return interaction.editReply({ embeds: [thing] });
    }
}; 