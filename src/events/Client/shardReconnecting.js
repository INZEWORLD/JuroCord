export default {
  name: "shardReconnecting",
  run: async (client, id) => {
  client.logger.log(`Shard #${id} Повторное подключение`, "log");
  }
};