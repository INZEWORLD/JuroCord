import { CommandInteraction, Client, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { convertTime } from '../../utils/convert.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'play',
  description: 'Включает треки/плейлисты / To play some song/playlist.',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  player: false,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  options: [
    {
      name: 'input',
      description: 'Поиск / Search (name/url)',
      required: true,
      type: 3,
    },
  ],

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: false,
    });
    // Проверяет установлен ли язык на сервере Discord
    await checkServerLanguage(interaction.guildId);

    if (!interaction.guild.members.me.permissions.has([PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]))
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(
              i18next.t(`joinparm`),
            ),
        ],
      });
    const { channel } = interaction.member.voice;

    if (!interaction.guild.members.me.permissionsIn(channel).has([PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]))
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(
              i18next.t(`joinparm2`),
            ),
        ],
      });

    const emojiaddsong = client.emoji.addsong;
    const emojiplaylist = client.emoji.playlist;
    let query = interaction.options.getString('input');

    const player = await client.manager.createPlayer({
      guildId: interaction.guildId,
      voiceId: interaction.member.voice.channelId,
      textId: interaction.channelId,
      deaf: true,
    });

    const result = await player.search(query, { requester: interaction.user });

    if (!result.tracks.length) return interaction.editReply({ content: i18next.t('noresult') });
    const tracks = result.tracks;

    if (result.type === "PLAYLIST") for (let track of result.tracks) player.queue.add(track);
    else player.queue.add(result.tracks[0]);


    if (!player.playing && !player.paused) player.play();

    return interaction.editReply(
      result.type === 'PLAYLIST' ? {
          embeds: [
            new EmbedBuilder()
              .setColor(client.embedColor)
              .setDescription(
                i18next.t(`playplst`, { emojiplaylist: `${emojiplaylist}`, trackslength: `${tracks.length}`, resultplaylistName: `${result.playlistName}`}),
              ),
          ],
        }
        : {
          embeds: [
            new EmbedBuilder()
              .setColor(client.embedColor)
              .setDescription( i18next.t(`play`, { emojiaddsong: `${emojiaddsong}`, trackstitle: `${tracks[0].title}`, tracksuri: `${tracks[0].uri}`}),
            ),
          ],
        },
    );
  },
};
