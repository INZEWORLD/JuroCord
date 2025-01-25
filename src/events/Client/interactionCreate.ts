import { GuildMember, Interaction, PermissionFlagsBits, PermissionsBitField } from 'discord.js';
import db from '../../schema/setup';
import db2 from '../../schema/dj';
import { JuroCord } from '../../structures/JuroCord';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
	name: 'interactionCreate',
	run: async (client : JuroCord, interaction : Interaction) => {
    const memberPermissions = interaction.memberPermissions;
		if (interaction.isCommand() || interaction.isContextMenuCommand()) {
			const SlashCommands = client.slashCommands.get(interaction.commandName);
			if (!SlashCommands) return;
			const player = client.manager.players.get(interaction.guildId);
			// Проверяет установлен ли язык на сервере Discord
			await checkServerLanguage(interaction.guildId);
			if (SlashCommands.player && !player) {
				return await interaction.reply({
					content: i18next.t('interactionCreate_player'),
					ephemeral: true,
				}).catch(() => { });
			}
			if (SlashCommands.userPrams && SlashCommands.userPrams.length > 0 && !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
				return await interaction.reply({
          content: i18next.t('interactionCreate_member_userPrams', { permissions: SlashCommands.userPrams.join(', ') }),
					ephemeral: true,
				});
			}
			if (SlashCommands.inVoiceChannel && interaction.member instanceof GuildMember && !interaction.member.voice.channel) {
				return await interaction
					.reply({
            content: i18next.t('interactionCreate_member_voice'),
						ephemeral: true,
					})
					.catch(() => { });
			}
			if (SlashCommands.sameVoiceChannel && interaction.guild.members.me.voice.channel && (interaction.member instanceof GuildMember && interaction.guild.members.me.voice.channelId !== interaction.member.voice.channelId)) {
				return await interaction
					.reply({
						content: i18next.t('interactionCreate_voice', { interaction_voice: `${interaction.client.user}`}),
						ephemeral: true,
					})
					.catch(() => { });
			}
			if (SlashCommands.dj) {
				let data = await db2.findOne({ Guild: interaction.guildId })
				let perm = PermissionFlagsBits.ManageGuild;
				if (data) {
					if (data.Mode) {
						let pass = false;
						if (data.Roles.length > 0 && interaction.member instanceof GuildMember) {
							interaction.member.roles.cache.forEach((x) => {
								let role = data.Roles.find((r) => r === x.id);
								if (role) pass = true;
							});
						};
						if (!pass && interaction.member instanceof GuildMember && !memberPermissions.has(perm)) return await interaction.reply({ content: i18next.t('interactionCreate_GuildMember'), ephemeral: true })
						};
				};
			};
			try {
				await SlashCommands.run(client, interaction);
			} catch (error) {
				if (interaction.replied) {
					await interaction
						.editReply({
							content: i18next.t('interactionCreate_err'),
						})
						.catch(() => { });
				} else {
					await interaction
						.followUp({
							ephemeral: true,
							content: i18next.t('interactionCreate_err1'),
						})
						.catch(() => { });
				}
				console.error(error);
			}
		}
		if (interaction.isButton()) {
			let data = await db.findOne({ Guild: interaction.guildId });
			if (data && interaction.channelId === data.Channel && interaction.message.id === data.Message) return client.emit("playerButtons", interaction, data);
		};
	}
};
