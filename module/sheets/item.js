import { WILDSEA } from '../config.js'
import { enrich } from '../helpers.js'

export default class WildseaItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 600,
      height: 400,
    })
  }

  async getData() {
    const context = super.getData()
    context.config = WILDSEA
    context.system = this.item.system
    context.system.enrichedDetails = await enrich(this.item.system.details)
    context.effects = this.item.effects
    return context
  }
}
