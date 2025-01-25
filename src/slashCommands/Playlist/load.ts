import { EmbedBuilder, CommandInteraction, Client, ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, VoiceState, GuildMember, APIMessage, MessagePayload, InteractionEditReplyOptions } from 'discord.js';
import db from '../../schema/playlist';
import { noun } from '../../utils/utils';
import { JuroCord } from '../../structures/JuroCord';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
	name: 'load',
	description: 'Включает сохраненный плейлист. / Play a saved playlist.',
	userPrams: [],
	botPrams: ['EMBED_LINKS'],
	player: false,
	inVoiceChannel: true,
	sameVoiceChannel: true,
	options: [
		{
			name: 'name',
			description: 'Название сохраненного плейлиста  / Name saved playlist',
			required: true,
			type: 3,
		},
	],
	run: async (client: JuroCord, interaction: ChatInputCommandInteraction) => {
		await interaction.deferReply({});
		// Проверяет установлен ли язык на сервере Discord
		await checkServerLanguage(interaction.guildId);
		const playlistName = interaction.options.getString('name');
		const data = await db.findOne({ UserId: interaction.member.user.id, PlaylistName: playlistName });
		const caller = interaction.member as (GuildMember & VoiceState); if(!caller.voice) return;
		const player = await client.manager.createPlayer({
			guildId: interaction.guildId,
			voiceId: caller.voice?.channel.id,
			textId: interaction.channelId,
			deaf: true,
		});
		if (!data) return interaction.editReply(makeDescriptionEmbedMessage(client, i18next.t(`loadlistno`)));
		await interaction.editReply(makeDescriptionEmbedMessage(client, i18next.t(`loadadd`, { dataplaylistlength: `${data.Playlist.length}`, playlistname: `${playlistName}`})));

		for (const track of data.Playlist) {
			const search = await player.search(track.uri || track.title)
			if(search.tracks.length > 0) {
				search.tracks[0].requester = caller
				player.queue.add(search.tracks[0]);
			}
		}
		if (!player.queue.current) return await interaction.editReply(makeDescriptionEmbedMessage(client, i18next.t(`loadnoadd`, { playlistname: `${playlistName}`})));
		player.play();
		return await interaction.editReply(makeDescriptionEmbedMessage(client, i18next.t(`load`, { playerqueuetotalsize: `${player.queue.totalSize}`,  playlistname: `${playlistName}`})));	
	},
};

function makeDescriptionEmbedMessage(client: JuroCord, description: string) {
	return {
		embeds: [new EmbedBuilder().setColor(client.embedColor).setDescription(description)]
	} as InteractionEditReplyOptions
} 