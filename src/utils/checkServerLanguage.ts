import i18next from 'i18next';
import { getServerLanguage } from '../slashCommands/Settings/setlanguage';

async function checkServerLanguage(guildId: string) {
  const guildLanguage = await getServerLanguage(guildId);
  await i18next.changeLanguage(guildLanguage);
}

export { checkServerLanguage };
