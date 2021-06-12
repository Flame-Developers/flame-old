const FlameListener = require('../../structures/FlameListener');
const InteractionData = require('../../utils/interactions/InteractionData');

class InteractionCreateListener extends FlameListener {
  constructor() {
    super('InteractionCreateListener', {
      ws: true,
      event: 'INTERACTION_CREATE',
    });
  }

  run(client, interaction) {
    switch (interaction.type) {
      case 2:
        if (client.interactions.has(interaction.data.name)) {
          return client.interactions
            .get(interaction.data.name)
            .run(client, new InteractionData(client, interaction));
        }
        break;
      case 3:
        if (client.buttonCache.has(interaction.message.id)) {
          client.buttonCache.get(interaction.message.id)(interaction);
          // eslint-disable-next-line max-len
          return client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 6 }});
        }
    }
  }
}

module.exports = InteractionCreateListener;
