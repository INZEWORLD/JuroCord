import {
	EmbedBuilder,
	ActionRowBuilder,
	CommandInteraction,
	Client,
	StringSelectMenuBuilder,
	ComponentType,
	ChatInputCommandInteraction,
	ActionRow,
	ApplicationCommandData,
	StringSelectMenuComponentData,
	StringSelectMenuComponent,
	StringSelectMenuInteraction,
	Collection,

} from 'discord.js';
import { JuroCord } from '../../structures/JuroCord';
import { noun } from '../../utils/utils';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
	name: 'help',
	description: 'Лист команд / List commands',
	userPrams: [],
	botPrams: ['EMBED_LINKS'],
	run: async (client : JuroCord, interaction : ChatInputCommandInteraction) => {
		await interaction.deferReply({
			ephemeral: true,
		});

      // Проверяет установлен ли язык на сервере Discord
      await checkServerLanguage(interaction.guildId);
		const embed = new EmbedBuilder()
		.setTitle(i18next.t('help_main_menu_title', { username: client.user.username }))
		.setDescription(i18next.t('help_main_menu_description', { user: `<@${interaction.user.id}>`, username: client.user.username }))
		.setThumbnail(client.user.displayAvatarURL())
		.setColor(client.embedColor)
		.setTimestamp()
		.setFooter({
		  text: i18next.t('help_requested_by', { user_tag: interaction.user.tag }),
		  iconURL: interaction.user.displayAvatarURL(),
		});
	  
		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('helpop')
				.setMinValues(1)
				.setMaxValues(1)
				.setPlaceholder(i18next.t('help_button_menu'))
				.addOptions([
					{
						label: i18next.t('music_label'),
						value: 'Music',
						emoji: '🎼',
					},
					{
						label: i18next.t('filters_label'),
						value: 'Filters',
						emoji: '🎙️',
					},
					{
						label: i18next.t('playlist_label'),
						value: 'Playlist',
						emoji: '🗒️',
					},
					{
						label: i18next.t('information_label'),
						value: 'Information',
						emoji: 'ℹ',
					},
					{
						label: i18next.t('settings_label'),
						value: 'Settings',
						emoji: '⚙️',
					},
					{
						label: i18next.t('home_label'),
						value: 'Home',
						emoji: '🏠',
					},
				])
			)

		const m = await interaction.editReply({ embeds: [embed], components: [row] });
		const collector = m.createMessageComponentCollector({
			filter: (b) => {
				if (b.user.id === interaction.user.id) return true;
				else {
					b.reply({
						
						ephemeral: true,
						content: i18next.t('help_button_error', { user: `<@${interaction.user.id}>` }), 
					});
					return false;
				}
			},
			componentType: ComponentType.StringSelect,
			time: 60000,
			idle: 60000 / 2,
		});

		collector.addListener("end", async collected => {
			row.components[0] = (row.components[0] as StringSelectMenuBuilder)
				.setCustomId('disable_h')
				.setDisabled(true)
				.setPlaceholder(i18next.t(`help_button_time`))
			return interaction.editReply({ components: [row] }).catch(() => {});
		});

		collector.addListener("collect", async (selectInteraction: StringSelectMenuInteraction) => {
			if (!selectInteraction.deferred) selectInteraction.deferUpdate();
			const category : string = selectInteraction.values[0];
			if (category == "Home") return await interaction.editReply({
				embeds: [embed],
				components: [row],
			});
			const commands = filterAndMapByCategory(client.slashCommands, category);
			const categoryStrings : {
				[category: string]: [category: string, noun_one: string, noun_from_two: string, noun_zero_or_from_fime: string]
			} = {
				"Music": [
					i18next.t('category_music_title'),
					i18next.t('category_music_singular'),
					i18next.t('category_music_plural'),
					i18next.t('category_music_genitive_plural')
				],
				"Filters": [
					i18next.t('category_filters_title'),
					i18next.t('category_filters_singular'),
					i18next.t('category_filters_plural'),
					i18next.t('category_filters_genitive_plural')
				],
				"Playlist": [
					i18next.t('category_playlist_title'),
					i18next.t('category_playlist_singular'),
					i18next.t('category_playlist_plural'),
					i18next.t('category_playlist_genitive_plural')
				],
				"Settings": [
					i18next.t('category_settings_title'),
					i18next.t('category_settings_singular'),
					i18next.t('category_settings_plural'),
					i18next.t('category_settings_genitive_plural')
				],
				"Information": [
					i18next.t('category_information_title'),
					i18next.t('category_information_singular'),
					i18next.t('category_information_plural'),
					i18next.t('category_information_genitive_plural')
				],
			}
			return await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(client.embedColor)
						.setDescription(i18next.t(commands.length > 0 ? commands.join(', ') : "help_no_cmd"))
						.setTitle(categoryStrings[category][0])
						.setFooter({ text: i18next.t('help_all_cmd', { noun: noun(commands.length, categoryStrings[category][1], categoryStrings[category][2], categoryStrings[category][3]) }) 
					}),
				],
				components: [row],
			});
		});
	},
};

export const filterAndMapByCategory = (commands : Collection<string, any>, category : string): string[] => commands.filter((command) => command.category== category).map((command) => `\`${command.name}\``);
