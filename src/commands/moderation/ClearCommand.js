const FlameCommand = require('../../structures/FlameCommand');
const { getHelp } = require('../../utils/Functions');

class ClearCommand extends FlameCommand {
  constructor() {
    super('clear', {
      description: 'Очищает определенное кол-во сообщений в канале.',
      category: 'moderation',
      usage: 'clear <Кол-во сообщений> [Пользователь|',
      aliases: ['purge'],
      examples: [
        'f.clear 100',
        'f.clear 20 422255876624351232',
        'f.clear 20 @Markelore#3793',
      ],
      cooldown: 3,
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES'],
    });
  }

  async run(message, args) {
    if (!args[0]) return getHelp(message, this.name);
    if (isNaN(args[0]) || parseInt(args[0]) < 1 || parseInt(args[0]) >= 1000 || !parseInt(args[0])) return message.fail('Укажите пожалуйста **верное** число сообщений (от 1 до 1000).');

    const user = message.mentions.members.first()
      || message.guild.members.cache.get(args[1])
      || null;

    try {
      let deleted = 0;

      do {
        let messages = await message.channel.messages.fetch({ limit: 100 });
        if (user) messages = messages.filter((m) => m.author.id === user.id);
        // eslint-disable-next-line max-len
        messages = messages.map((m) => m.id).filter((m) => m !== message.id).slice(0, parseInt(args[0]) - deleted);

        await message.channel.bulkDelete(messages).catch(null);
        if (messages.length < 1) break;

        deleted += messages.length;
      } while (deleted !== parseInt(args[0]));

      return message.channel.send(`${message.client.constants.emojis.DONE} Успешно удалено **${args[0]}** сообщений ${user ? `от пользователя **${user.user.tag}** (${user.id})` : `по запросу модератора **${message.author.tag}**`}!`);
    } catch {
      return message.fail('Я не могу удалять сообщения старше **14** дней.');
    }
  }
}

module.exports = ClearCommand;
