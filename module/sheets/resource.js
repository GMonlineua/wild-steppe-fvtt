import { WILDSTEPPE } from '../config.js'
import WildsteppeItemSheet from './item.js'

export default class WildsteppeResourceSheet extends WildsteppeItemSheet {
  get template() {
    return `${WILDSTEPPE.root_path}/templates/sheets/resource.hbs`
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 500,
      height: 165,
    })
  }
}
