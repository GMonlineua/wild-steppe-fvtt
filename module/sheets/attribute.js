import { WILDSEA } from '../config.js'
import { enrich } from '../helpers.js'

export default class WildseaAttributeSheet extends ItemSheet {
  get template() {
    return `${WILDSEA.root_path}/templates/sheets/attribute.hbs`
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 600,
      height: 400,
    })
  }

  async getData() {
    const context = super.getData()

    context.system = this.item.system
    context.system.enrichedDetails = await enrich(this.item.system.details)

    return context
  }
}
