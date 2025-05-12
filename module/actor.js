export default class WildseaActor extends Actor {
  static getDefaultArtwork(data) {
    return {
      img: CONFIG.wildsea.defaultTokens[data.type],
      texture: { src: CONFIG.wildsea.defaultTokens[data.type] },
    }
  }

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user)
    if (data.type === 'player' || data.type === 'ship') {
      const prototypeToken = {
        sight: { enabled: true },
        actorLink: true,
        disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
      }
      return this.updateSource({ prototypeToken })
    }
  }
}
