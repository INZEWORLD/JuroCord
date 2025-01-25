import { CommandInteraction, Client, EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import db from '../../schema/dj';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
    name: "adddj",
    description: "Настройка роли диджея. / Setting up the DJ role.",
    userPrams: ['ADMINISTRATOR'],
    botPrams: ['MANAGE_GUILD'],
    options: [
        {
            name: "role",
            description: "Role mention.",
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
        const role = interaction.options.getRole('role');

        // Проверка, не @everyone ли это
        if (role.id === interaction.guild.roles.everyone.id) {
            return interaction.editReply({ embeds: [new EmbedBuilder().setDescription(i18next.t('everyone_not_allowed')).setColor(client.embedColor)] });
        }

        if (!data) {
            data = new db({
                Guild: interaction.guildId,
                Roles: [role.id],
                Mode: true
            })
            await data.save();
            return await interaction.editReply({ embeds: [new EmbedBuilder().setDescription(i18next.t('adddj', { role: role.name })).setColor(client.embedColor)] })
        } else {
            let rolecheck = data.Roles.find((x) => x === role.id);
            if (rolecheck) return interaction.editReply({ embeds: [new EmbedBuilder().setDescription(i18next.t('adddjw')).setColor(client.embedColor)] })
            data.Roles.push(role.id);
            await data.save();
            return await interaction.editReply({ embeds: [new EmbedBuilder().setDescription(i18next.t('adddjy', { role: role.name })).setColor(client.embedColor)] })

        }
    }
};
