export default {
  once: true,
  async execute(bot: any, event: any) {
    bot.music.updateVoiceState(event)
  }
};