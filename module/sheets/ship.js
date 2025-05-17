import { WILDSEA } from '../config.js'
import { renderDialog } from '../dialog.js'
import { clamp, clickModifiers, enrich } from '../helpers.js'
import WildseaActorSheet from './actor.js'
import * as Dice from '../dice.js'

export default class WildseaShipSheet extends WildseaActorSheet {
  get template() {
    return `${WILDSEA.root_path}/templates/sheets/ship.hbs`
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 1000,
      height: 750,
    })
  }

  async getData() {
    const context = await super.getData()
    context.system = this.actor.system

    for (const item of this.actor.items) {
      item.system.enrichedDetails = await enrich(item.system.details)
      if (item.system.stakes)
        context.stakesUsed += parseInt(item.system.stakes) || 0
    }

    context.aspects = this.actor.itemTypes.aspect.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    context.factions = this.actor.itemTypes.faction.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    context.temporaryTracks = this.actor.itemTypes.temporaryTrack.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    return context
  }

  activateListeners(html) {
    if (this.isEditable) {
      if (this.actor.isOwner) {
        html.find('.track').click(this.adjustTrack.bind(this, 1))
        html.find('.track').contextmenu(this.adjustTrack.bind(this, -1))

        html.find('.addItem').click(this.addItem.bind(this))
        html.find('.damage-button').click(this.toggleFittingDamaged.bind(this))
      }
      html.find('.ratingRoll').click(this.ratingRoll.bind(this))
    }
    super.activateListeners(html)
  }

  async adjustTrack(change, event) {
    event.preventDefault()

    const data = event.currentTarget.dataset
    const itemType = data.itemType
    const itemId = data.itemId

    switch (itemType) {
      case 'rating':
        await this.adjustRating(itemId, change, clickModifiers(event))
        break
      case 'reputations':
        await this.adjustSlimTrack(
          itemId,
          itemType,
          clickModifiers(event),
          change,
        )
        break
      default:
        break
    }
  }

  async adjustRating(rating, change = 1, isBurn) {
    const ratingMax = this.actor.system.ratings[rating]?.max || 6
    const marks = this.actor.system.ratings[rating]?.value
    const burns = this.actor.system.ratings[rating]?.burn

    let update = {
      system: {
        ratings: {
          [rating]: {
            value: marks,
            burn: burns,
          },
        },
      },
    }

    if (isBurn) {
      const newBurn = clamp(burns + change, ratingMax)
      update.system.ratings[rating].burn = newBurn
      if (marks <= burns) {
        update.system.ratings[rating].value = newBurn
      }
    } else {
      const newValue = clamp(marks + change, ratingMax, burns)
      update.system.ratings[rating].value = newValue
    }

    this.actor.update({ ...update })
  }

  async addItem(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.dataset

    switch (data.itemType) {
      case 'cargo':
        this.addSlimItem(data.itemType)
        break
      case 'faction':
        this.addFaction()
        break
      case 'aspect':
        this.addAspect()
        break
      case 'temporaryTrack':
        this.addTemporaryTrack()
        break
      default:
        ui.notifications.warn(
          `Type "${data.itemType}" not recognised or not implemented`,
        )
        break
    }
  }

  async addFaction() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('wildsea.newAspectName'),
      type: 'faction',
      system: {
        details: game.i18n.localize('wildsea.newAspectDetails'),
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }

  async addAspect() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('wildsea.newAspectName'),
      type: 'aspect',
      system: {
        details: game.i18n.localize('wildsea.newAspectDetails'),
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }

  async addTemporaryTrack() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('wildsea.newTemporaryTrackName'),
      type: 'temporaryTrack',
      system: {
        details: game.i18n.localize('wildsea.newTemporaryTrackDetails'),
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }

  async ratingRoll(event) {
    event.preventDefault()
    const rolling = event.currentTarget.dataset.rating

    const ratings = {}
    for (const rating of WILDSEA.shipRatings) {
      const shipRating = this.actor.system.ratings[rating]
      ratings[rating] = shipRating.value
    }

    const advantageOptions = Object.fromEntries(
      [0, 1, 2, 3].map((n) => [n, `+${n}d`]),
    )

    const cutOptions = Object.fromEntries(
      [0, 1, 2, 3].map((n) => [n, `${n}d`]),
    )

    const data = await renderDialog(
      game.i18n.localize('wildsea.ratingRoll'),
      this.handleRatingRoll,
      { rating: rolling, ratings, advantageOptions, cutOptions },
      '/systems/wild-steppe/templates/dialogs/rating_roll.hbs',
    )

    if (data.cancelled) return

    console.log(data)
    const { rating, advantage, cut } = data

    const ratingDice = this.actor.system.ratings[rating]

    const dicePool = {
      rating: rolling,
      ratingDice: ratingDice.value,
      advantage,
      cut,
    }

    console.log(dicePool)

    const [roll, outcome] = await Dice.rollPool(dicePool)

    const chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: await renderTemplate(
        'systems/wild-steppe/templates/chat/roll.hbs',
        outcome,
      ),
      roll,
      sound: CONFIG.sounds.dice,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    }
    ChatMessage.create(chatData)
  }

  handleRatingRoll(html) {
    const form = html[0].querySelector('form')
    return {
      rating: form.rating.value,
      cut: parseInt(form.cut.value || 0),
    }
  }

  async toggleFittingDamaged(event) {
    const target = event.currentTarget
    const fittingID = target.dataset.fittingId

    const fitting = this.actor.items.get(fittingID)
    const prevStatus = fitting.system.damaged
    fitting.update({ 'system.damaged': !prevStatus })
  }
}
