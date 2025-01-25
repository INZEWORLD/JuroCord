export default {
  name: "shardResume",
  run: async (client, id, replayedEvents) => {
  client.logger.log(`Shard #${id} Возобновлено`, "log");
  }
};
