export default {
  name: "shardError",
  run: async (client, error, id) => {
  client.logger.log(`Shard #${id} Ошибка`, "error");
  }
};