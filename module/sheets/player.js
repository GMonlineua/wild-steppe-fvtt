import { WILDSTEPPE } from '../config.js'
import { enrich, listToRows, clamp } from '../helpers.js'
import WildsteppeActorSheet from './actor.js'

export default class WildsteppePlayerSheet extends WildsteppeActorSheet {
  get template() {
    return `${WILDSTEPPE.root_path}/templates/sheets/player.hbs`
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 1100,
      height: 750,
    })
  }

  async getData() {
    const context = await super.getData()
    context.skillsList = listToRows(WILDSTEPPE.skills, 2)
    context.knowledgesList = listToRows(WILDSTEPPE.knowledges, 2)

    for (const item of this.actor.items) {
      item.system.enrichedDetails = await enrich(item.system.details)
    }

    context.system = this.actor.system

    const resources = this.actor.itemTypes.resource
    for (const resourceType of WILDSTEPPE.resourceTypes) {
      context.system[resourceType] = resources
        .filter((r) => r.system.type === resourceType)
        .sort((a, b) => (a.sort < b.sort ? -1 : 1))
    }

    context.aspects = this.actor.itemTypes.aspect.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    context.temporaryAspects = this.actor.itemTypes.temporaryAspect.sort((a, b) =>
      a.sort < b.sort ? -1 : 1,
    )

    context.projects = this.actor.itemTypes.project.sort((a, b) =>
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
    const newValue = clamp(currentValue + change, WILDSTEPPE.skillMax)

    this.actor.update({
      system: {
        skills: {
          [key]: newValue,
        },
      },
    })
  }

  async adjustKnowledges(key, change = 1) {
    const currentValue = this.actor.system.knowledges[key] || 0
    const newValue = clamp(currentValue + change, WILDSTEPPE.knowledgeMax)

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
      case 'temporaryAspect':
        this.addTemporaryAspect()
        break
      case 'project':
        this.addProject()
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
      name: game.i18n.localize('wildsteppe.newAspectName'),
      type: 'aspect',
      system: {
        details: game.i18n.localize('wildsteppe.newAspectDetails'),
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }

  async addResource() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('wildsteppe.newResourceName'),
      type: 'resource',
      system: {
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }

  async addTemporaryAspect() {
    const defaultData = {}

    const itemData = {
      name: game.i18n.localize('wildsteppe.newTemporaryAspectName'),
      type: 'temporaryAspect',
      system: {
        details: game.i18n.localize('wildsteppe.newTemporaryAspectDetails'),
        ...defaultData,
      },
    }

    this.addEmbeddedDocument(itemData)
  }

  async updateRoll(event) {
    event.preventDefault()
    const data = event.currentTarget.dataset
    const dicePool = game.wildsteppe.dicePool
    dicePool.setSkill(data.value)
  }
}
