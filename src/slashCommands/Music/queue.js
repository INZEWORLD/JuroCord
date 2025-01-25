import { Client, CommandInteraction, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ApplicationCommandOptionType } from 'discord.js';
import { convertTime } from '../../utils/convert.js';
import load from 'lodash';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'queue',
  description: 'Показывает всю очередь. / To see the entire server queue.',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  player: true,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  options: [
    {
      name: 'page',
      type: 10,
      required: false,
      description: `Номер страницы очереди / Queue page number.`,
    },
  ],

  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction) => {
    await interaction.deferReply().catch(() => {});
    // Проверяет установлен ли язык на сервере Discord
    await checkServerLanguage(interaction.guildId);

    const player = client.manager.players.get(interaction.guildId);
    
    if (!player.queue.current)
      return await interaction
        .editReply({
          content: i18next.t(`queuenoplay`),
        })
        .catch(() => {});

    if (player.queue.length === 0 || !player.queue.length) {
      const embed = new EmbedBuilder()
        .setColor(client.embedColor)
        .setDescription(
          i18next.t(`queue`, { playerqueuecurrenttitle: `${player.queue.current.title}`, playerqueuecurrenturi: `${player.queue.current.uri}`, playerqueuecurrentisstream: `${player.queue.current.isStream ? '[**◉ LIVE**]' : convertTime(player.queue.current.length)}`, playerqueuecurrentrequester: `${player.queue.current.requester}`}),
        );
      await interaction.editReply({
        embeds: [embed],
      });
    } else {
      const mapping = player.queue.map(
        (t, i) =>
          `\`[ ${++i} ]\` • [${t.title}](${t.uri}) • \`[ ${
            t.isStream ? '[**◉ LIVE**]' : convertTime(t.length)
          } ]\` • [${t.requester}]`,
      );

      const chunk = load.chunk(mapping, 10);
      const pages = chunk.map((s) => s.join('\n'));
      let page = interaction.options.getNumber('page');
      if (!page) page = 0;
      if (page) page = page - 1;
      if (page > pages.length) page = 0;
      if (page < 0) page = 0;

      if (player.queue.length < 11) {
        const embed2 = new EmbedBuilder()
          .setColor(client.embedColor)
          .setDescription(i18next.t(`queuepage`, { playerqueuecurrenttitle: `${player.queue.current.title}`, playerqueuecurrenturi: `${player.queue.current.uri}`, playerqueuecurrentisstream: `${player.queue.current.isStream ? '[**◉ LIVE**]' : convertTime(player.queue.current.length)}`, playerqueuecurrentrequester: `${player.queue.current.requester}`, page: `${pages[page]}`}),
        )
          .setFooter({
            text: i18next.t(`pages`, { pageslength: `${page + 1}/${pages.length}`}),
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setThumbnail(
            `${
              player.queue.current.thumbnail
                ? player.queue.current.thumbnail
                : `https://img.youtube.com/vi/${player.queue.current.identifier}/hqdefault.jpg`
            }`,
          )
          .setTitle(i18next.t(`queuetitle`, { interactionguildname: `${interaction.guild.name}`}));
        await interaction.editReply({
            embeds: [embed2],
          })
          .catch(() => {});
      } else {
         const embed3 = new EmbedBuilder()
           .setColor(client.embedColor)
           .setDescription(i18next.t(`queuepage`, { playerqueuecurrenttitle: `${player.queue.current.title}`, playerqueuecurrenturi: `${player.queue.current.uri}`, playerqueuecurrentisstream: `${player.queue.current.isStream ? '[**◉ LIVE**]' : convertTime(player.queue.current.length)}`, playerqueuecurrentrequester: `${player.queue.current.requester}`, page: `${pages[page]}`}),
          )
           .setFooter({
            text: i18next.t(`pages`, { pageslength: `${page + 1}/${pages.length}`}),
             iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
           })
           .setThumbnail(
             `${
               player.queue.current.thumbnail
                 ? player.queue.current.thumbnail
                 : `https://img.youtube.com/vi/${player.queue.current.identifier}/hqdefault.jpg`
             }`,
           )
           .setTitle(i18next.t(`queuetitle`, { interactionguildname: `${interaction.guild.name}`}));

        const but1 = new ButtonBuilder()
          .setCustomId('queue_cmd_but_1_app')
          .setEmoji('⏭️')
          .setStyle(1);

        const dedbut1 = new ButtonBuilder()
          .setDisabled(true)
          .setCustomId('queue_cmd_ded_but_1_app')
          .setEmoji('⏭️')
          .setStyle(2);

        const but2 = new ButtonBuilder()
          .setCustomId('queue_cmd_but_2_app')
          .setEmoji('⏮️')
          .setStyle(1);

        const dedbut2 = new ButtonBuilder()
          .setDisabled(true)
          .setCustomId('queue_cmd_ded_but_2_app')
          .setEmoji('⏮️')
          .setStyle(2);

        const but3 = new ButtonBuilder()
          .setCustomId('queue_cmd_but_3_app')
          .setEmoji('⏹️')
          .setStyle(4);

        const dedbut3 = new ButtonBuilder()
          .setDisabled(true)
          .setCustomId('queue_cmd_ded_but_3_app')
          .setEmoji('⏹️')
          .setStyle(2);

        const msg = await interaction
          .editReply({
            embeds: [embed3],
            components: [new ActionRowBuilder().addComponents([but2, but3, but1])],
          })
          .catch(() => {});

        const collector = msg.createMessageComponentCollector({
          filter: (b) => {
            if (b.user.id === interaction.user.id) return true;
            else
              return b
                .reply({
                  content: i18next.t(`queuecmd`, { interactionusertag: `${interaction.user.tag}`}),
                })
                .catch(() => {});
          },
          time: 60000 * 5,
          idle: 30e3,
        });

        collector.on('collect', async (button) => {
          if (button.customId === 'queue_cmd_but_1_app') {
            await button.deferUpdate().catch(() => {});
            page = page + 1 < pages.length ? ++page : 0;

            const embed4 = new EmbedBuilder()
              .setColor(client.embedColor)
              .setDescription(i18next.t(`queuepage`, { playerqueuecurrenttitle: `${player.queue.current.title}`, playerqueuecurrenturi: `${player.queue.current.uri}`, playerqueuecurrentisstream: `${player.queue.current.isStream ? '[**◉ LIVE**]' : convertTime(player.queue.current.length)}`, playerqueuecurrentrequester: `${player.queue.current.requester}`, page: `${pages[page]}`}),
            )
              .setFooter({
                text: i18next.t(`pages`, { pageslength: `${page + 1}/${pages.length}`}),
                iconURL:interaction.user.displayAvatarURL({ dynamic: true }),
              })
              .setThumbnail(
                `${
                  player.queue.current.thumbnail
                    ? player.queue.current.thumbnail
                    : `https://img.youtube.com/vi/${player.queue.current.identifier}/hqdefault.jpg`
                }`,
              )
              .setTitle(`${interaction.guild.name} Queue`);

            await interaction.editReply({
              embeds: [embed4],
              components: [new ActionRowBuilder().addComponents([but2, but3, but1])],
            });
          } else if (button.customId === 'queue_cmd_but_2_app') {
            await button.deferUpdate().catch(() => {});
            page = page > 0 ? --page : pages.length - 1;

            const embed5 = new EmbedBuilder()
              .setColor(client.embedColor)
              .setDescription(i18next.t(`queuepage`, { playerqueuecurrenttitle: `${player.queue.current.title}`, playerqueuecurrenturi: `${player.queue.current.uri}`, playerqueuecurrentisstream: `${player.queue.current.isStream ? '[**◉ LIVE**]' : convertTime(player.queue.current.length)}`, playerqueuecurrentrequester: `${player.queue.current.requester}`, page: `${pages[page]}`}),
            )

              .setFooter({
                text: i18next.t(`pages`, { pageslength: `${page + 1}/${pages.length}`}),
                iconURL:interaction.user.displayAvatarURL({ dynamic: true }),
              })
              .setThumbnail(
                `${
                  player.queue.current.thumbnail
                    ? player.queue.current.thumbnail
                    : `https://img.youtube.com/vi/${player.queue.current.identifier}/hqdefault.jpg`
                }`,
              )
              .setTitle(i18next.t(`queuetitle`, { interactionguildname: `${interaction.guild.name}`}));
              await interaction
              .editReply({
                embeds: [embed5],
                components: [new ActionRowBuilder().addComponents([but2, but3, but1])],
              })
              .catch(() => {});
          } else if (button.customId === 'queue_cmd_but_3_app') {
            await button.deferUpdate().catch(() => {});
            await collector.stop();
          } else return;
        });

        collector.on('end', async () => {
          await interaction.editReply({
            embeds: [embed3],
            components: [new ActionRowBuilder().addComponents([dedbut2, dedbut3, dedbut1])],
          });
        });
      }
    }
  },
};
