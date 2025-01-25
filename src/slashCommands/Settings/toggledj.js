import { CommandInteraction, Client, EmbedBuilder } from 'discord.js';
import db from '../../schema/dj';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
    name: "toggledj",
    description: "Измените роль диджея. / Switch DJ role.",
    userPrams: ['ADMINISTRATOR'],
    botPrams: ['MANAGE_GUILD'],
    options: [
        {
            name: 'toggledj',
            description: 'Включите «Отключить роли диджея». / Enable «Disable DJ Roles».',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'Включить / enable',
                    value: `dj_on`,
                },
                {
                    name: 'Отключить / disable',
                    value: `dj_off`,
                },
            ],
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
        const input = interaction.options.getString('toggledj')

        if (!data) return interaction.editReply({ embeds: [new EmbedBuilder().setDescription(i18next.t(`togglednoset`)).setColor(client.embedColor)] })
        if (input === `dj_on`) {
            let mode = false;
            if (!data.Mode) mode = true;
            data.Mode = mode;
            await data.save();
            const thing = new EmbedBuilder()
                .setColor(client.embedColor)
                .setDescription(i18next.t(`toggledj`))
            await interaction.editReply({ embeds: [thing] })
        }

        if (input === `dj_off`) {
            let mode = true;
            if (data.Mode) mode = false;
            data.Mode = mode;
            await data.save();
            const thing = new EmbedBuilder()
                .setColor(client.embedColor)
                .setDescription(i18next.t(`toggledjoff`))
            return await interaction.editReply({ embeds: [thing] })
        }

    }
};