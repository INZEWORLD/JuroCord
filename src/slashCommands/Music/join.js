import { EmbedBuilder, CommandInteraction, Client, PermissionFlagsBits } from 'discord.js';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'join',
  description: 'Присоединяется к голосовому каналу / Joins a voice channel',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  player: false,
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

    const { channel } = interaction.member.voice;
    const player = client.manager.players.get(interaction.guild.id);
    if (player) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(`я уже подключен к <#${player.voiceId}>!`),
        ],
      });
    } else {
      if (
        !interaction.guild.members.me.permissions.has([PermissionFlagsBits.Connect, PermissionFlagsBits.Speak])
      )
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.embedColor)
              .setDescription(
                i18next.t(`joinparm`),
              ),
          ],
        });

      if (
        !interaction.guild.members.me.
          permissionsIn(channel)
          .has([PermissionFlagsBits.Connect, PermissionFlagsBits.Speak])
      )
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.embedColor)
              .setDescription(
                i18next.t(`joinparm2`),
              ),
          ],
        });

      const emojiJoin = interaction.client.emoji.join;

      await client.manager.createPlayer({
        guildId: interaction.guild.id,
        voiceId: interaction.member.voice.channel.id,
        textId: interaction.channel.id,
        deaf: true,
      });

      let thing = new EmbedBuilder()
        .setColor(client.embedColor)
        .setDescription(
          i18next.t(`join`, { emojiJoin: `${emojiJoin}`, channelid: `${channel.id}`}),
        );
      return interaction.editReply({ embeds: [thing] });
    }
  },
};
