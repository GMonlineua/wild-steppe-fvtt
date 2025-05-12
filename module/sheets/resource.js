import { WILDSEA } from '../config.js'
import WildseaItemSheet from './item.js'

export default class WildseaResourceSheet extends WildseaItemSheet {
  get template() {
    return `${WILDSEA.root_path}/templates/sheets/resource.hbs`
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 500,
      height: 165,
    })
  }
}
