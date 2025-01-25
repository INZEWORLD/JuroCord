import { CommandInteraction, Client, EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import db from '../../schema/dj';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
    name: "removedj",
    description: "Удалить роль диджея. / Remove DJ role.",
    userPrams: ['ADMINISTRATOR'],
    botPrams: ['MANAGE_GUILD'],
    options: [
        {
            name: "role",
            description: "Упоминание роли / Role mention.",
            required: true,
            type: ApplicationCommandOptionType.Role
        }
    ],
    /**
    * @param {Client} client
    * @param {CommandInteraction} interaction
    */

    run: async (client, interaction) => {

        await interaction.deferReply({
            ephemeral: false
        });
    // Проверяет установлен ли язык на сервере Discord
    await checkServerLanguage(interaction.guildId);

        let data = await db.findOne({ Guild: interaction.guildId });
        if (!data) return interaction.editReply({ embeds: [new EmbedBuilder().setDescription(i18next.t('removedjwarn')).setColor("Blurple")] });

        let role = interaction.options.getRole('role');

        // Проверка роли
        if (role.id === interaction.guild.roles.everyone.id) {
            return interaction.editReply({ embeds: [new EmbedBuilder().setDescription(i18next.t('everyone_not_allowed')).setColor(client.embedColor)] });
        }

        // Удаление роли
        const index = data.Roles.indexOf(role.id);
        if (index > -1) {
            data.Roles.splice(index, 1);
            await data.save();
            return interaction.editReply({ embeds: [new EmbedBuilder().setDescription(i18next.t('removedj', { role: role.name })).setColor("Blurple")] });
        } else {
            return interaction.editReply({ embeds: [new EmbedBuilder().setDescription(i18next.t('removedjwarn')).setColor("Blurple")] });
        }

    }
};
