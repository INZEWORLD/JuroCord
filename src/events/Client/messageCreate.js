import { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import db from '../../schema/prefix.js';
import db2 from '../../schema/setup';
import db3 from '../../schema/dj';
import { checkServerLanguage } from '../../utils/checkServerLanguage';
import i18next from 'i18next';

export default {
  name: 'messageCreate',
  run: async (client, message) => {
    if (message.author.bot || !message.guild) return;

    // Проверяет, находится ли сообщение в определенном канале настройки
    let data = await db2.findOne({ Guild: message.guildId });
    if (data && data.Channel && message.channelId === data.Channel) {
      return client.emit("setupSystem", message);
    }

    // Получить префикс для сервера
    let prefix = client.prefix;
    const ress = await db.findOne({ Guild: message.guildId });
    if (ress && ress.Prefix) {
      prefix = ress.Prefix;
    }

      // Проверяет установлен ли язык на сервере Discord
      await checkServerLanguage(message.guildId);

    // Ответить на упоминание бота информацией
    const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (message.content.match(mention)) {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel(i18next.t('link')).setStyle('LINK').setURL(client.config.links.invite),
      );
      const embed = new EmbedBuilder()
        .setColor(client.embedColor)
        .setDescription(i18next.t(`mcreat`, { authorusername: `${message.author.username}`}));
      return message.channel.send({ embeds: [embed], components: [row] });
    }

    // Проверяет, начинается ли сообщение с префикса или упоминания бота
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;
    const [matchedPrefix] = message.content.match(prefixRegex);

    // Разбор команды и аргументов
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    // Проверка разрешений бота
    const botPermissions = [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks];
    if (!message.guild.members.me.permissions.has(botPermissions)) {
      return await message.author.dmChannel.send({
        content: i18next.t('mcommand', { commandn: `${command.name}`, channelId: `${message.channelId}`}),
      }).catch(() => {});
    }

    // Проверка на отсутствие аргументов
    if (command.args && !args.length) {
      let reply = i18next.t(`marg`, { messageauthor: `${message.author}`});
      if (command.usage) {
        reply += `\nИспользование: \`${prefix}${command.name} ${command.usage}\``;
      }
      const embed = new EmbedBuilder().setColor('Red').setDescription(reply);
      return message.channel.send({ embeds: [embed] });
    }

    // Проверка разрешений пользователя
    if (command.userPrams && !message.member.permissions.has(command.userPrams)) {
      const embed = new EmbedBuilder().setColor('Red').setDescription(
        i18next.t(`mparmsuse`, { cmduserPrams: `${command.userPrams.join(', ')}`}
      ));
      return message.channel.send({ embeds: [embed] });
    }

    // Проверка разрешений бота для команды
    if (command.botPrams && !message.guild.members.me.permissions.has(command.botPrams)) {
      const embed = new EmbedBuilder().setColor('Red').setDescription(
        i18next.t(`mparmsbot`, { cmdbotPrams: `${command.botPrams.join(', ')}`
      }));
      return message.channel.send({ embeds: [embed] });
    }

    // Убедитесь, что у бота есть разрешение на встраивание ссылок
    if (!channel.permissionsFor(message.guild.members.me)?.has(PermissionFlagsBits.EmbedLinks)) {
      return channel.send({ content: i18next.t('membedparm')
      });
    }

    // Проверка команд только для владельцев
    if (command.owner && client.owner) {
      const isOwner = client.owner.includes(message.author.id);
      if (!isOwner) {
        const embed = new EmbedBuilder().setColor('Red').setDescription(i18next.t(`mownerparm`));
        return message.channel.send({ embeds: [embed] });
      }
    }

    // Проверка музыкальных команд
    const player = client.manager.players.get(message.guild.id);
    if (command.player && !player) {
      const embed = new EmbedBuilder().setColor('Red').setDescription(i18next.t('mguildparm'));
      return message.channel.send({ embeds: [embed] });
    }
    if (command.inVoiceChannel && !message.member.voice.channelId) {
      const embed = new EmbedBuilder().setColor('Red').setDescription(i18next.t('mguildvoce'));
      return message.channel.send({ embeds: [embed] });
    }
    if (command.sameVoiceChannel && message.guild.members.me.voice.channel && message.guild.members.me.voice.channelId !== message.member.voice.channelId) {
      const embed = new EmbedBuilder().setColor('Red').setDescription(i18next.t(`muserv`, { muser: `${message.client.user}`}));
      return message.channel.send({ embeds: [embed] });
    }

    // Проверка команд DJ
    if (command.dj) {
      let data = await db3.findOne({ Guild: message.guild.id });
      if (data && data.Mode) {
        let hasRole = data.Roles.some((roleId) => message.member.roles.cache.has(roleId));
        if (!hasRole && !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
          const embed = new EmbedBuilder().setColor('Red').setDescription(i18next.t(`mdj`));
          return message.channel.send({ embeds: [embed] });
        }
      }
    }
    try {
      await command.execute(message, args, client, prefix);
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder().setColor('Red').setDescription(
        i18next.t(`merr`)
      );
      message.channel.send({ embeds: [embed] });
    }
  },
};
