import {
    CommandInteraction,
    Client,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
    ChannelType,
    OverwriteType,
    ButtonStyle,
} from "discord.js";
import db from '../../schema/setup';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
    name: "setupmusic",
    description: "Установить плеер на сервер / Install the player on the server",
    userPrams: ['MANAGE_GUILD'],
    botPrams: ['EMBED_LINKS'],
    options: [
        {
            name: "set",
            description: "Установить плеер на сервер. / Install the player on the server.",
            type: 1

        },
        {
            name: "delete",
            description: "Удаление плеера с сервера / Removing the player from the server",
            type: 1
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
        if (interaction.options.getSubcommand() === "set") {
            if (data) return await interaction.editReply({ content: i18next.t(`setupac`)});
            let everyone = interaction.guild.roles.everyone ? interaction.guild.roles.everyone : await interaction.guild.roles.fetch(interaction.guildId)
            const parent = await interaction.guild.channels.create({
                name: `Music ${client.user.username}`,
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        type: OverwriteType.Member,
                        id: client.user.id,
                        allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
                    },
                    {
                        type: OverwriteType.Role,
                        id: everyone,
                        allow: [PermissionFlagsBits.ViewChannel]
                    }
                ]
            });

            const textChannel = await interaction.guild.channels.create({
                name: `player`, 
                type: ChannelType.GuildText,
                parent: parent.id,
                permissionOverwrites: [
                    {
                        type: OverwriteType.Member,
                        id: client.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ReadMessageHistory]
                    },
                    {
                        type: OverwriteType.Role,
                        id: everyone,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                        deny: [PermissionFlagsBits.UseApplicationCommands]
                    }
                ]
            });

            let rates = [1000 * 64, 1000 * 96, 1000 * 128, 1000 * 256, 1000 * 384];
            let rate = rates[0];

            switch (interaction.guild.premiumTier) {
                case "NONE":
                    rate = rates[1];
                    break;

                case "TIER_1":
                    rate = rates[2];
                    break;

                case "TIER_2":
                    rate = rates[3];
                    break;

                case "TIER_3":
                    rate = rates[4];
                    break;
            };

            const voiceChannel = await interaction.guild.channels.create({
                name: `Music`, 
                type: ChannelType.GuildVoice,
                parent: parent.id,
                bitrate: rate,
                userLimit: 35,
                permissionOverwrites: [
                    {
                        type: OverwriteType.Member,
                        id: client.user.id,
                        allow: ["Connect", "Speak", "ViewChannel", "RequestToSpeak"]
                    },
                    {
                        type: OverwriteType.Role,
                        id: everyone,
                        allow: ["Connect", "ViewChannel"],
                        deny: ["Speak"]
                    }
                ]
            });

            let disabled = true;
            let player = client.manager.players.get(interaction.guildId);
            if (player) disabled = false;

            const title = player && player.queue && player.queue.current ? i18next.t(`setupmusic`) : i18next.t("setupmusicoff");
            const desc = player && player.queue && player.queue.current ? `[${player.queue.current.title}](${player.queue.current.uri})` : null;
            const image = client.config.links.bg;

            let embed1 = new EmbedBuilder().setColor(client.embedColor).setTitle(title).setImage(image);
            if(player && player.queue && player.queue.current) embed1.setFooter({
                "text": i18next.t(`setupprequest`, { setuprequestag: `${player.queue.current.requester.tag}`}),
                "iconURL": `${player.queue.current.requester.displayAvatarURL({ dynamic: true })}`
            })

            if (player && player.queue && player.queue.current) embed1.setDescription(desc);
            const but1 = new ButtonBuilder().setCustomId(`${interaction.guildId}pause`).setEmoji(`⏸️`).setStyle(ButtonStyle.Secondary).setDisabled(disabled)
            const but2 = new ButtonBuilder().setCustomId(`${interaction.guildId}previous`).setEmoji(`⏮️`).setStyle(ButtonStyle.Secondary).setDisabled(disabled)
            const but3 = new ButtonBuilder().setCustomId(`${interaction.guildId}skip`).setEmoji(`⏭️`).setStyle(ButtonStyle.Secondary).setDisabled(disabled)
            const but6 = new ButtonBuilder().setCustomId(`${interaction.guildId}stop`).setEmoji(`⏹️`).setStyle(ButtonStyle.Secondary).setDisabled(disabled)
            const but7 = new ButtonBuilder().setCustomId(`${interaction.guildId}loop`).setEmoji(`🔁`).setStyle(ButtonStyle.Secondary).setDisabled(disabled)


            const row = new ActionRowBuilder().addComponents( but2, but6, but1, but7, but3)


            const msg = await textChannel.send({
                embeds: [embed1],
                components: [row]
            });


            const Ndata = new db({
                Guild: interaction.guildId,
                Channel: textChannel.id,
                Message: msg.id,
                voiceChannel: voiceChannel.id,
            });

            await Ndata.save();
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(client.embedColor)
                    .setTitle(i18next.t("setup"))
                    .setDescription(i18next.t(`setupdiscript`, { textchannel: `${textChannel}`, textchannel1: `${textChannel}`}))
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                ]
            });
        } else if (interaction.options.getSubcommand() === "delete") {
            if (!data) return await interaction.editReply({ content: i18next.t(`setupnochanel`) });
            await data.delete();
            return await interaction.editReply({ content: i18next.t(`setupdel`) });
        }
    }
};
