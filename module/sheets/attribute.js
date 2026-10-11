import { WILDSTEPPE } from '../config.js'
import { enrich } from '../helpers.js'

export default class WildsteppeAttributeSheet extends foundry.appv1.sheets.ItemSheet {
  get template() {
    return `${WILDSTEPPE.root_path}/templates/sheets/attribute.hbs`
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
