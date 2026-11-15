import { WILDSTEPPE } from '../config.js'
import { clamp, clickModifiers, makeSortable } from '../helpers.js'
import { renderDialog } from '../dialog.js'
import * as Dice from '../dice.js'

export default class WildsteppeActorSheet extends foundry.appv1.sheets.ActorSheet {
  async getData() {
    const context = super.getData()
    context.config = WILDSTEPPE
    context.showBurnTooltip = game.settings.get('wildsteppe', 'showBurnTooltip')
    for (const [itemType, max] of Object.entries(WILDSTEPPE.slimTracks)) {
      for (const item of this.actor.system[itemType] ?? []) {
        item.track ??= { value: 0, burn: 0, max }
      }
    }
    return context
  }

  activateListeners(html) {
    if (this.isEditable) {
      if (this.actor.isOwner) {
        // Item context menu
        new ContextMenu(html, '.itemContextMenu', this.itemContextMenu)
        new ContextMenu(html, '.slimContextMenu', this.slimContextMenu)

        // collapse aspects and temp tracks
        html.find('.item .itemContextMenu').click(this.collapseItem.bind(this))

        // Item tracks
        html.find('.item .track').click(this.increaseItemTrack.bind(this))
        html.find('.item .track').contextmenu(this.reduceItemTrack.bind(this))

        html.find('.slim-item .track').click(this.adjustSlimTrack.bind(this, 1))
        html
        .find('.slim-item .track')
        .contextmenu(this.adjustSlimTrack.bind(this, -1))

        html.find('.rollCounter').click(this.rollCounter.bind(this))

        for (const list of html.find('.slim-list')) {
          makeSortable(list, '.slim-item', (element, newIndex) =>
          this.moveSlimItem(
            element.dataset.itemId,
            newIndex,
            element.dataset.itemType,
          ),
          )
        }
      }
    }
    super.activateListeners(html)
  }

  itemContextMenu = [
    {
      name: game.i18n.localize('wildsteppe.toChat'),
      icon: '<i class="fas fa-comment"></i>',
      callback: (element) => {
        const itemId = element.closest('.item').data('item-id')
        this.sendItemToChat(itemId)
      },
    },
    {
      name: game.i18n.localize('wildsteppe.edit'),
      icon: '<i class="fas fa-edit"></i>',
      callback: (element) => {
        const itemId = element.closest('.item').data('item-id')
        this.actor.items.get(itemId).sheet.render(true)
      },
    },
    {
      name: game.i18n.localize('wildsteppe.delete'),
      icon: '<i class="fas fa-trash"></i>',
      callback: (element) => {
        const itemId = element.closest('.item').data('item-id')
        this.actor.deleteEmbeddedDocuments('Item', [itemId])
      },
    },
  ]

  slimContextMenu = [
    {
      name: game.i18n.localize('wildsteppe.toChat'),
      icon: '<i class="fas fa-comment"></i>',
      callback: (element) => {
        const itemId = element.data('item-id')
        const itemType = element.data('item-type')
        this.sendSlimToChat(itemId, itemType)
      },
    },
    {
      name: game.i18n.localize('wildsteppe.edit'),
      icon: '<i class="fas fa-edit"></i>',
      callback: (element) => {
        const itemId = element.data('item-id')
        const itemType = element.data('item-type')
        this.editSlimItem(itemId, itemType)
      },
    },
    {
      name: game.i18n.localize('wildsteppe.delete'),
      icon: '<i class="fas fa-trash"></i>',
      callback: (element) => {
        const itemId = element.data('item-id')
        const itemType = element.data('item-type')
        this.removeSlimItem(itemId, itemType)
      },
    },
  ]

  async addEmbeddedDocument(itemData) {
    const docs = await this.actor.createEmbeddedDocuments('Item', [itemData])
    docs.forEach((item) => item.sheet.render(true))
  }

  async addProject() {
    this.addEmbeddedDocument({
      name: game.i18n.localize('wildsteppe.newProjectName'),
      type: 'project',
      system: {
        details: game.i18n.localize('wildsteppe.newProjectDetails'),
      },
    })
  }

  async addSlimItem(itemType, itemSubtype = null) {
    const data = await renderDialog(
      game.i18n.format('wildsteppe.newSlim', {
        type: game.i18n.localize(`wildsteppe.${itemType}`),
      }),
      this.processSlimDialog,
    )

    if (data.cancelled) return

    const text = data.text

    const id = foundry.utils.randomID()

    const slimData = {
      id,
      text,
    }
    if (data.description !== undefined) slimData.description = data.description

    if (itemSubtype) slimData['subtype'] = itemSubtype

    let items = []

    if (this.actor.system[itemType] != null) {
      items = [...this.actor.system[itemType]]
      items.push(slimData)
    } else {
      items.push(slimData)
    }

    this.actor.update({
      system: {
        [itemType]: items,
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

  async editSlimItem(itemId, itemType) {
    const items = this.actor.system[itemType]
    const item = items.filter((i) => i.id === itemId)[0]

    if (item) {
      const data = await renderDialog(
        game.i18n.format('wildsteppe.editSlim', {
          type: game.i18n.localize(`wildsteppe.${itemType}`),
        }),
        this.processSlimDialog,
        {
          ...item,
          hasDescription: WILDSTEPPE.slimWithDescription.includes(itemType),
        },
      )

      if (data.cancelled || !data.text) return

      item.text = data.text
      if (data.description !== undefined) item.description = data.description
      this.actor.update({
        system: {
          [itemType]: items,
        },
      })
    }
  }

  processSlimDialog(html) {
    const form = html[0].querySelector('form')
    return {
      text: form.text.value.trim(),
      description: form.description?.value.trim(),
    }
  }

  async removeSlimItem(itemId, itemType) {
    this.actor.update({
      system: {
        [itemType]: this.actor.system[itemType].filter(
          (item) => item.id !== itemId,
        ),
      },
    })
  }

  async adjustSlimTrack(change, event) {
    event.preventDefault()
    event.stopPropagation()

    const { itemId, itemType } = event.currentTarget.dataset
    const items = this.actor.system[itemType]
    const item = items.find((i) => i.id === itemId)
    if (!item?.track) return

      const { value, burn, max } = item.track
      if (clickModifiers(event)) {
        item.track.burn = clamp(burn + change, max)
        if (value <= burn) item.track.value = item.track.burn
      } else {
        item.track.value = clamp(value + change, max, burn)
      }

      this.actor.update({ system: { [itemType]: items } })
  }

  async sendSlimToChat(itemId, itemType) {
    const item = this.actor.system[itemType].filter((i) => i.id === itemId)[0]
    if (item) {
      item.title = game.i18n.localize(`wildsteppe.${itemType}`)

      const template = 'systems/wild-steppe/templates/chat/slim.hbs'
      const html = await renderTemplate(template, item)

      ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: html,
      })
    }
  }

  async sendItemToChat(itemId) {
    const item = this.actor.items.get(itemId)
    if (item) {
      const template = 'systems/wild-steppe/templates/chat/item.hbs'
      const html = await renderTemplate(template, item)

      ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: html,
      })
    }
  }

  async increaseItemTrack(event) {
    event.preventDefault()

    const target = event.currentTarget
    const itemId = target.dataset.itemId
    const item = this.actor.items.get(itemId)

    this.itemTrackUpdate(item, clickModifiers(event))
  }

  async reduceItemTrack(event) {
    event.preventDefault()

    const target = event.currentTarget
    const itemId = target.dataset.itemId
    const item = this.actor.items.get(itemId)

    this.itemTrackUpdate(item, clickModifiers(event), -1)
  }

  //updateValue is positive for add, negative for subtract.
  async itemTrackUpdate(item, isBurn, updateValue = 1) {
    const marks = item.system.track.value
    const burns = item.system.track.burn
    const max = item.system.track.max

    let update = {
      system: {
        track: {
          value: marks,
          burn: burns,
        },
      },
    }

    if (isBurn) {
      const newBurn = clamp(burns + updateValue, max)

      update.system.track.burn = newBurn
      if (marks <= burns) {
        update.system.track.value = newBurn
      }
    } else {
      const newValue = clamp(marks + updateValue, max, burns)
      update.system.track.value = newValue
    }
    item.update({ ...update })
  }

  async collapseItem(event) {
    event.preventDefault()
    const itemElement = event.currentTarget.closest('.item')
    const itemId = itemElement.dataset.itemId
    $(itemElement)
      .find('.drawer')
      .slideToggle({
        done: () => {
          this.toggleVisibility(itemId)
        },
      })
  }

  toggleVisibility(itemId) {
    const item = this.actor.items.get(itemId)

    if (item) {
      const visible = !item.system.collapsed ? false : true

      item.update({
        system: {
          collapsed: !visible,
        },
      })
    }
  }

  moveSlimItem(id, newIndex, itemType) {
    const items = this.actor.system[itemType]

    const item = items.find((i) => i.id === id)
    items.splice(items.indexOf(item), 1)
    items.splice(newIndex, 0, item)

    this.actor.update({
      system: {
        [itemType]: items,
      },
    })
  }

  async rollCounter(event) {
    event.preventDefault()
    const rolling = event.currentTarget.dataset.id

    const counters = {}
    for (const [key, data] of Object.entries(this.actor.system.counters)) {
      counters[key] = data.level
    }

    const advantageOptions = Object.fromEntries(
      [0, 1, 2, 3].map((n) => [n, `+${n}d`]),
    )

    const cutOptions = Object.fromEntries(
      [0, 1, 2, 3].map((n) => [n, `${n}d`]),
    )

    const data = await renderDialog(
      game.i18n.localize('wildsteppe.counterRoll'),
      this.handleCounterRoll,
      { counter: rolling, counters, advantageOptions, cutOptions },
      '/systems/wild-steppe/templates/dialogs/counter_roll.hbs',
    )

    if (data.cancelled) return

      const { counter, advantageDice, cut } = data

    const dicePool = {
      counter,
      ratingDice: this.actor.system.counters[counter]?.level || 0,
      advantageDice,
      cut,
    }

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
