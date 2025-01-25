export default {
  name: "shardDisconnect",
  run: async (client, event, id) => {
  client.logger.log(`Shard #${id} Отключено`, "warn");
  }
};
