import { Logger } from "@_immails/logger";
import dotenv from "dotenv"
dotenv.config()  

export const prefix = process.env.PREFIX || 'q'

export default {
  token: process.env.TOKEN || '',
  prefix: process.env.PREFIX || 'q',
  ownerID: process.env.OWNERID?.split(',') || ['',''], 
  SpotifyID: process.env.SPOTIFYID || '', // 
  SpotifySecret: process.env.SPOTIFYSECRET || '', 
  mongourl: process.env.MONGO_URI || 'mongodb+srv://', 
  embedColor: process.env.EMBED_COLOR || '3366ff', 
  logs: process.env.LOGS || '', 
  links: {
    support: process.env.SUPPORT || '',
    invite: process.env.INVITE || '',
    vote: process.env.VOTE || '',
    bg: process.env.BG || ''
  },
  nodes: [
    {
      url: process.env.NODE_URL || '',
      name: process.env.NODE_NAME || 'Main',
      auth: process.env.NODE_AUTH || 'saher',
      secure: parseBoolean(process.env.NODE_SECURE || 'false'),
    },
  ],
};

function parseBoolean(value){
  if (typeof(value) === 'string'){
    value = value.trim().toLowerCase();
  }
  switch(value){
    case true:
    case "true":
      return true;
    default:
      return false;
  }
}
