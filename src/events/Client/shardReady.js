
import { logBotInfo } from './../../utils/utils';
export default {
  	name: "shardReady",
  	run: async (client, id) => {
    	logBotInfo(`Shard`, id, `готов`)
	}
};
