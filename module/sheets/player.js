import { WILDSEA } from '../config.js'
import { renderDialog } from '../dialog.js'
import { enrich, listToRows, clamp, clickModifiers } from '../helpers.js'
import WildseaActorSheet from './actor.js'
import * as Dice from '../dice.js'

export default class WildseaPlayerSheet extends WildseaActorSheet {
  get template() {
    return `${WILDSEA.root_path}/templates/sheets/player.hbs`
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 1100,
      height: 750,
    })
  }

  async getData() {
    const context = await super.getData()
    context.skillsList = listToRows(WILDSEA.skills, 2)
    context.knowledgesList = listToRows(WILDSEA.knowledges, 2)

    for (const item of this.actor.items) {
      item.system.enrichedDetails = await enrich(item.system.details)
    }

    context.system = this.actor.system

    const resources = this.actor.itemTypes.resource
    for (const resourceType of WILDSEA.resourceTypes) {
      context.system[resourceType] = resources
        .filter((r) => r.system.type === resourceType)
        .sort((a, b) => (a.sort < b.sort ? -1 : 1))
    }

    context.aspects = this.actor.itemTypes.aspect.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    context.temporaryTracks = this.actor.itemTypes.temporaryTrack.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    context.system.resources = this.actor.itemTypes.resource.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    return context
  }

  activateListeners(html) {
    if (this.isEditable) {
      if (this.actor.isOwner) {
        // other tracks
        html.find('.list-track .track').click(this.increaseListTrack.bind(this))
        html
          .find('.list-track .track')
          .contextmenu(this.decreaseListTrack.bind(this))

        // Add item
        html.find('.addItem').click(this.addItem.bind(this))

        // rollable links
        html.find('.roll').click(this.updateRoll.bind(this))

        // roll counter
        html.find('.rollCounter').click(this.rollCounter.bind(this))
      }
    }

    super.activateListeners(html)
  }

  async increaseListTrack(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.closest('.track').dataset

    switch (data.itemType) {
      case 'skill':
        this.adjustSkill(data.itemId)
        break
      case 'knowledge':
        this.adjustKnowledges(data.itemId)
        break
      case 'counter':
        this.adjustCounter(data.itemId)
        break
      default:
        break
    }
  }

  async decreaseListTrack(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.closest('.track').dataset

    switch (data.itemType) {
      case 'skill':
        this.adjustSkill(data.itemId, -1)
        break
      case 'knowledge':
        this.adjustKnowledges(data.itemId, -1)
        break
      case 'counter':
        this.adjustCounter(data.itemId, -1)
        break
      default:
        break
    }
  }

  async adjustSkill(key, change = 1) {
    const currentValue = this.actor.system.skills[key] || 0
    const newValue = clamp(currentValue + change, WILDSEA.skillMax)

    this.actor.update({
      system: {
        skills: {
          [key]: newValue,
        },
      },
    })
  }

  async adjustCounter(counter, change = 1) {
    const counterMax = this.actor.system.counters[counter]?.max || 3
    const marks = this.actor.system.counters[counter]?.value

    let update = {
      system: {
        counters: {
          [counter]: {
            value: marks,
          },
        },
      },
    }

    const newValue = clamp(marks + change, counterMax)
    update.system.counters[counter].value = newValue

    this.actor.update({ ...update })
  }

  async adjustKnowledges(key, change = 1) {
    const currentValue = this.actor.system.knowledges[key] || 0
    const newValue = clamp(currentValue + change, WILDSEA.knowledgeMax)

    this.actor.update({
      system: {
        knowledges: {
          [key]: newValue,
        },
      },
    })
  }

  async addItem(event) {
    event.preventDefault()

    const target = event.currentTarget
    const data = target.dataset

    switch (data.itemType) {
      case 'relationship':
        this.addSlimItem('relationships')
        break
      case 'drive':
        this.addSlimItem('drives')
        break
      case 'aspect':
        this.addAspect()
        break
      case 'resource':
        this.addResource()
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

  async addResource() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('wildsea.newResourceName'),
      type: 'resource',
      system: {
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

  async updateRoll(event) {
    event.preventDefault()
    const data = event.currentTarget.dataset
    const dicePool = game.wildsea.dicePool
    dicePool.setSkill(data.value)
  }

  async rollCounter(event) {
    event.preventDefault()
    const rolling = event.currentTarget.dataset.id

    const counters = {}
    for (const counter of WILDSEA.counters) {
      const countersData = this.actor.system.counters[counter]
      counters[counter] = countersData.level
    }

    const advantageOptions = Object.fromEntries(
      [0, 1, 2, 3].map((n) => [n, `+${n}d`]),
    )

    const cutOptions = Object.fromEntries(
      [0, 1, 2, 3].map((n) => [n, `${n}d`]),
    )

    const data = await renderDialog(
      game.i18n.localize('wildsea.counterRoll'),
      this.handleCounterRoll,
      { counter: rolling, counters, advantageOptions, cutOptions },
      '/systems/wild-steppe/templates/dialogs/counter_roll.hbs',
    )

    if (data.cancelled) return

    const { counter, advantageDice, cut } = data

    const counterDice = this.actor.system.counters[counter];

    const dicePool = {
      counter: rolling,
      ratingDice: counterDice.level,
      advantageDice,
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

  handleCounterRoll(html) {
    const form = html[0].querySelector('form')
    return {
      counter: form.counter.value,
      cut: parseInt(form.cut.value || 0),
      advantageDice: parseInt(form.advantage.value || 0),
    }
  }
}
