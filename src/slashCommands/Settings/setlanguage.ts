import { CommandInteraction, Client } from 'discord.js';
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import i18next from 'i18next';
import enTranslation from '../../locales/en.json';
import ruTranslation from '../../locales/ru.json';
import uaTranslation from '../../locales/ua.json';

// Загрузка переменных из .env
config();

// Инициализация i18next
i18next.init({
  interpolation: {
    escapeValue: false, // не обязательно, если вы не используете React
    prefix: '{{', // префикс для заменяемых меток
    suffix: '}}', // суффикс для заменяемых меток
  },
  resources: {
    en: {
      translation: enTranslation,
    },
    ru: {
      translation: ruTranslation,
    },
    ua: {
      translation: uaTranslation,
    },
  },
});

const uri = process.env.MONGO_URI;
const mongoClient = new MongoClient(uri);

async function getServerLanguage(guildId: string): Promise<string> {
  await mongoClient.connect();
  const database = mongoClient.db('savikcord');
  const serverSettings = database.collection('language');

  // Получаем язык сервера из базы данных
  const result = await serverSettings.findOne({ _id: guildId });
  await mongoClient.close();

  return result?.language || 'en'; // Возвращаем язык сервера или "en" по умолчанию
}

export default {
  name: 'language',
  description: 'Устанавливает язык бота на сервере. / Sets the bot language on the server.',
  userPrams: ['MANAGE_GUILD'],
  botPrams: ['EMBED_LINKS'],
  options: [
    {
      name: 'set',
      description: 'Set Language - Выберите язык ("ru", "ua", "en")',
      required: true,
      type: 3,
      choices: [
        { name: "ru", value: "ru" },
        { name: "en", value: "en" },
        { name: "ua", value: "ua" },
      ]
    },
  ],

  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      // Defer ответ, чтобы избежать тайм-аута взаимодействия
      await interaction.deferReply({ ephemeral: true });

      // Получаем выбранный пользователем язык
      const languageOption = interaction.options.get('set');
      const selectedLanguage = (languageOption?.value as string) || "ru";

      // Проверяем, доступен ли выбранный язык
      if (!['ru', 'en', 'ua'].includes(selectedLanguage)) {
        return interaction.editReply({ content: i18next.t('language_not_available') });
      }

      // Устанавливаем язык сервера в базе данных
      await mongoClient.connect();
      const database = mongoClient.db('savikcord');
      const serverSettings = database.collection('language');

      const updateResult = await serverSettings.findOneAndUpdate(
        { _id: interaction.guild.id },
        { $set: { language: selectedLanguage } },
        { upsert: true, returnDocument: 'after' }
      );

      // Обновляем язык в i18next
      await i18next.changeLanguage(selectedLanguage);

      // Отправляем сообщение об успешной установке языка
      await interaction.editReply({ content: i18next.t('language_set_success', { language: selectedLanguage.toUpperCase() }) });
    } catch (error) {
      console.error('Ошибка при установке языка:', error);

      // Отправляем сообщение об ошибке
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply(i18next.t('language_set_error'));
      } else {
        await interaction.followUp(i18next.t('language_set_error'));
      }
    } finally {
      // Закрываем соединение с базой данных
      await mongoClient.close();
    }
  },
};

export { getServerLanguage };
