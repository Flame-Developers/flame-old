const InteractionResponse = require('../interactions/InteractionResponse');

class PaginatorEntry {
  constructor(plainText = null, embed = null) {
    this.plainText = plainText;
    this.embed = embed;
  }
}

class PaginatorUtil {
  constructor(client, user, pages = [], options = {}) {
    this._client = client;
    this.user = user ?? null;
    this.pages = pages;
    this.page = 0;
    this.options = options;
  }

  get buttons() {
    return [
      {
        type: 2,
        style: 1,
        custom_id: 'left',
        label: null,
        disabled: this.page === 0,
        emoji: {
          id: '849669446201114684',
        },
      },
      {
        type: 2,
        style: 1,
        custom_id: 'right',
        label: null,
        disabled: this.page + 1 === this.pages.length,
        emoji: {
          id: '849669541692571699',
        },
      },
      {
        type: 2,
        style: 4,
        custom_id: 'close_menu',
        label: null,
        disabled: this.options.disableCloseButton ?? false,
        emoji: {
          id: '862715940810653737'
        },
      },
    ];
  }

  async #refresh(newPage) {
    if (newPage > this.pages.length || newPage < 0) return null;
    this.page = newPage;
    return this._client.api.channels(this.message.channel_id).messages(this.message.id).patch({
      data: {
        content: this.pages[this.page]?.plainText,
        embed: this.pages[this.page]?.embed,
        components: [
          {
            type: 1,
            components: this.buttons,
          },
        ],
      },
    });
  }

  destroy() {
    this._client.cache.buttons.delete(this.message.id);
    this._client.api.channels(this.message.channel_id).messages(this.message.id).delete();
  }

  async init(channel, seconds = 120) {
    if (this.pages.some((entry) => !(entry instanceof PaginatorEntry))) throw new TypeError('Every page entry must be a valid instance of PaginatorEntry.');

    const data = this.pages[this.page];
    this.message = await this._client.api.channels(channel.id).messages.post({
      data: {
        content: data.plainText,
        embed: data.embed,
        components: [
          {
            type: 1,
            components: this.buttons,
          },
        ],
      },
    });
    this._client.cache.buttons.set(this.message.id, (res) => {
      if (res.member.user.id !== this.user?.id)
        return new InteractionResponse(this._client, res).send('Взаимодействовать с кнопками может только тот, кто вызвал команду.', { flags: 64 });

      switch (res.data.custom_id) {
        case 'right':
          this.#refresh(this.page + 1);
          break;
        case 'left':
          this.#refresh(this.page - 1);
          break;
        case 'close_menu':
          this.destroy();
          break;
        default:
      }

      return this.message;
    });

    setTimeout(() => {
      this._client.cache.buttons.delete(this.message.id);
    }, seconds * 1000);
  }
}

module.exports = { PaginatorUtil, PaginatorEntry };
