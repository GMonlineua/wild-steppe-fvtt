export default class WildsteppeActor extends Actor {
  static getDefaultArtwork(data) {
    return {
      img: CONFIG.wildsteppe.defaultTokens[data.type],
      texture: { src: CONFIG.wildsteppe.defaultTokens[data.type] },
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
