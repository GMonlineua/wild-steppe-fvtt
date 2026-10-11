import { WILDSTEPPE } from './config.js';

export default class WildsteppeItem extends Item {
  static getDefaultArtwork(data) {
    const tokens = CONFIG.wildsteppe?.defaultTokens ?? WILDSTEPPE.defaultTokens;
    return {
      img: tokens[data.type],
      texture: { src: tokens[data.type] }
    };
  }
}
