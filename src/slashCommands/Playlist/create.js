import { EmbedBuilder, CommandInteraction, Client } from 'discord.js';
import db from '../../schema/playlist';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'create',
  description: "Создаёт плейлист. / Create playlist.",
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  options: [
    {
      name: 'name',
      description: 'Название плейлиста / Playlist name',
      required: true,
      type: 3,
    },
  ],
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction) => {
    await interaction.deferReply({});
    // Проверяет установлен ли язык на сервере Discord
    await checkServerLanguage(interaction.guildId);

    const Name = interaction.options.getString('name');
    const data = await db.find({ UserId: interaction.member.user.id, PlaylistName: Name });

    if (Name.length > 10) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t(`createwarn`)),
        ],
      });
    }
    if (data.length > 0) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(
              i18next.t(`createwarn1`, { name: `${Name}`}),
            ),
        ],
      });
    }
    let userData = db.find({
      UserId: interaction.user.id,
    });
    if (userData.length >= 10) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setDescription(i18next.t(`createwarnlist`)),
        ],
      });
    }
    const newData = new db({
      UserName: interaction.user.tag,
      UserId: interaction.user.id,
      PlaylistName: Name,
      CreatedOn: Math.round(Date.now() / 1000),
    });
    await newData.save();
    const embed = new EmbedBuilder()
      .setDescription(i18next.t(`create`, { name: `${Name}`}))
      .setColor(client.embedColor);
    return interaction.editReply({ embeds: [embed] });
  },
};
