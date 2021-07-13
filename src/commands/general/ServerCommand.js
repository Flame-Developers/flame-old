/* eslint-disable no-plusplus */
const { MessageEmbed } = require('discord.js');
const FlameCommand = require('../../structures/FlameCommand');
const { regions, verifyLevels } = require('../../utils/Constants');

class ServerCommand extends FlameCommand {
  constructor() {
    super('server', {
      description: 'Показывает информацию о сервере.',
      category: 'general',
      usage: 'server',
      aliases: ['serverinfo', 'server-info'],
    });
  }

  async run(message, args) {
    // Because Collection#filter() is very slow, we'll use this shitty way to get required numbers.
    let [onlineMembers, dndMembers, idleMembers, offlineMembers] = Array(4).fill(0);
    for (const member of Array.from(message.guild.members.cache.values())) {
      switch (member.user.presence.status) {
        case 'online':
          onlineMembers++;
          break;
        case 'dnd':
          dndMembers++;
          break;
        case 'idle':
          idleMembers++;
          break;
        case 'offline':
          offlineMembers++;
          break;
        default:
      }
    }
    const embed = new MessageEmbed()
      .setAuthor(`Информация о ${message.guild.name} (${message.guild.id})`, message.guild.iconURL())
      .setColor('ffa500')
      .addField(`Участников [${message.guild.memberCount}]:`, `<:online2:814075431758069790> В сети: **${
        onlineMembers
      }**\n<:dnd2:814075464078983229> Не беспокоить: **${
        dndMembers
      }**\n<:idle:814075524829282374> Не на месте: **${
        idleMembers
      }**\n<:offline2:814075554856304660> Не в сети: **${
        offlineMembers
      }**`,
      true)
      .addField(`Каналы [${message.guild.channels.cache.size}]:`, `<:textchannel:814927097453608972> Текстовых: **${message.guild.channels.cache.filter((x) => x.type === 'text').size}**\n<:voicechannel:814927126498246658> Голосовых: **${message.guild.channels.cache.filter((x) => x.type === 'voice').size}**`, true)
      .addField('Регион', regions[message.guild.region], true)
      .addField('Владелец', `${message.guild.owner.user.tag} (${message.guild.owner.id})`, true)
      .addField('Уровень проверки', verifyLevels[message.guild.verificationLevel], true)
      .addField('Дата создания', new Date(message.guild.createdAt).toLocaleString('ru'), true)
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setFooter(message.guild.name, message.guild.iconURL())
      .setTimestamp();

    if (message.guild.cache.premium) embed.setDescription('На данном сервере активированы бонусные возможности **Flame+**. Огромное спасибо за поддержку! 🔥');
    return message.reply(embed).catch();
  }
}

module.exports = ServerCommand;
