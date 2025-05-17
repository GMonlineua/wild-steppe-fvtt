import { WILDSEA } from '../config.js'
import WildseaItemSheet from './item.js'
import { renderDialog } from '../dialog.js'

export default class WildseaShipItemSheet extends WildseaItemSheet {
  get template() {
    return `${WILDSEA.root_path}/templates/sheets/ship_item.hbs`
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 600,
      height: 'auto',
      tabs: [
        {
          navSelector: '.tabs',
          contentSelector: '.sheet-body',
          initial: 'main',
        },
      ],
    })
  }

  async getData() {
    const context = await super.getData()
    return context
  }

  activateListeners(html) {
    if (this.isEditable) {
      if (this.item.isOwner) {
        html.find('.addRatingMod').click(this.addRatingMod.bind(this))
        html.find('.editRatingMod').click(this.editRatingMod.bind(this))
        html.find('.deleteRatingMod').click(this.deleteRatingMod.bind(this))

        html.find('.editEffect').click(this.editEffect.bind(this))
        html.find('.deleteEffect').click(this.deleteEffect.bind(this))
      }
    }
    super.activateListeners(html)
  }

  async addRatingMod(event) {
    event.preventDefault()

    const data = await renderDialog(
      game.i18n.localize('wildsea.ratingMod'),
      this.processRatingModDialog,
      { config: WILDSEA },
      '/systems/wild-steppe/templates/dialogs/design_rating_mod.hbs',
    )

    if (data.cancelled) return

    data.id = foundry.utils.randomID()
    const ratingMods =
      this.item.system.ratingMods != null
        ? [...this.item.system.ratingMods]
        : []
    ratingMods.push(data)

    this.item.update({
      system: {
        ratingMods,
      },
    })
  }

  async editRatingMod(event) {
    event.preventDefault()
    const ratingModId = event.currentTarget.dataset.ratingModId
    const ratingMods = this.item.system.ratingMods
    const ratingMod = ratingMods.filter((e) => e.id === ratingModId)[0]

    const data = await renderDialog(
      game.i18n.localize('wildsea.ratingMod'),
      this.processRatingModDialog,
      {
        config: WILDSEA,
        ...ratingMod,
      },
      '/systems/wild-steppe/templates/dialogs/design_rating_mod.hbs',
    )

    if (data.cancelled) return

    ratingMod.rating = data.rating
    ratingMod.value = data.value

    this.item.update({
      system: {
        ratingMods,
      },
    })
  }

  async deleteRatingMod(event) {
    event.preventDefault()
    const ratingModId = event.currentTarget.dataset.ratingModId
    this.item.update({
      system: {
        ratingMods: this.item.system.ratingMods.filter(
          (e) => e.id !== ratingModId,
        ),
      },
    })
  }

  processRatingModDialog(html) {
    const form = html[0].querySelector('form')
    return {
      rating: form.rating.value,
      value: parseInt(form.value.value || 0),
    }
  }

  editEffect(event) {
    event.preventDefault()
    const effectId = event.currentTarget.dataset.effectId
    this.item.effects.get(effectId).sheet.render(true)
  }

  deleteEffect(event) {
    event.preventDefault()
    const effectId = event.currentTarget.dataset.effectId
    this.item.deleteEmbeddedDocuments('ActiveEffect', [effectId])
  }
}
