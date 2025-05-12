import { WILDSEA } from '../config.js'
import { clamp, clickModifiers } from '../helpers.js'
import { renderDialog } from '../dialog.js'
import SortableJS from '../lib/sortable.complete.esm.js'

export default class WildseaActorSheet extends ActorSheet {
  async getData() {
    const context = super.getData()
    context.config = WILDSEA
    context.showBurnTooltip = game.settings.get('wildsea', 'showBurnTooltip')
    context.showAttributeTooltip = game.settings.get('wildsea', 'showAttributeTooltip')
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

        //reorder slim items
        for (const list of html.find('.slim-list'))
          this.reorderSlimListHandler(list)
      }
    }
    super.activateListeners(html)
  }

  itemContextMenu = [
    {
      name: game.i18n.localize('wildsea.toChat'),
      icon: '<i class="fas fa-comment"></i>',
      callback: (element) => {
        const itemId = element.closest('.item').data('item-id')
        this.sendItemToChat(itemId)
      },
    },
    {
      name: game.i18n.localize('wildsea.edit'),
      icon: '<i class="fas fa-edit"></i>',
      callback: (element) => {
        const itemId = element.closest('.item').data('item-id')
        this.actor.items.get(itemId).sheet.render(true)
      },
    },
    {
      name: game.i18n.localize('wildsea.delete'),
      icon: '<i class="fas fa-trash"></i>',
      callback: (element) => {
        const itemId = element.closest('.item').data('item-id')
        this.actor.deleteEmbeddedDocuments('Item', [itemId])
      },
    },
  ]

  slimContextMenu = [
    {
      name: game.i18n.localize('wildsea.toChat'),
      icon: '<i class="fas fa-comment"></i>',
      callback: (element) => {
        const itemId = element.data('item-id')
        const itemType = element.data('item-type')
        this.sendSlimToChat(itemId, itemType)
      },
    },
    {
      name: game.i18n.localize('wildsea.edit'),
      icon: '<i class="fas fa-edit"></i>',
      callback: (element) => {
        const itemId = element.data('item-id')
        const itemType = element.data('item-type')
        this.editSlimItem(itemId, itemType)
      },
    },
    {
      name: game.i18n.localize('wildsea.delete'),
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

  async addSlimItem(itemType, itemSubtype = null) {
    const data = await renderDialog(
      game.i18n.format('wildsea.newSlim', {
        type: game.i18n.localize(`wildsea.${itemType}`),
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

  async editSlimItem(itemId, itemType) {
    const items = this.actor.system[itemType]
    const item = items.filter((i) => i.id === itemId)[0]

    if (item) {
      const data = await renderDialog(
        game.i18n.format('wildsea.editSlim', {
          type: game.i18n.localize(`wildsea.${itemType}`),
        }),
        this.processSlimDialog,
        item,
      )

      if (data.cancelled || !data.text) return

      item.text = data.text
      this.actor.update({
        system: {
          [itemType]: items,
        },
      })
    }
  }

  processSlimDialog(html) {
    const form = html[0].querySelector('form')
    return { text: form.text.value.trim() }
  }

  async adjustSlimTrack(itemId, itemType, isBurn, value = 1) {
    const items = [...this.actor.system[itemType]]
    const item = items.filter((i) => i.id === itemId)[0]

    if (item) {
      const marks = item.track.value
      const burns = item.track.burn
      const max = item.track.max

      if (isBurn) {
        const newBurn = clamp(burns + value, max)
        item.track.burn = newBurn

        if (marks <= burns) {
          item.track.value = newBurn
        }
      } else {
        item.track.value = clamp(marks + value, max, burns)
      }

      this.actor.update({
        system: {
          [itemType]: items,
        },
      })
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

  async sendSlimToChat(itemId, itemType) {
    const item = this.actor.system[itemType].filter((i) => i.id === itemId)[0]
    if (item) {
      item.title = game.i18n.localize(`wildsea.${itemType}`)

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

  reorderSlimListHandler(list) {
    new SortableJS(list, {
      animation: 200,
      direction: 'vertical',
      draggable: '.slim-item',
      dragClass: 'drag-preview',
      ghostClass: 'drag-gap',
      onEnd: (event) => {
        const id = event.item.dataset.itemId
        const itemType = event.item.dataset.itemType
        const newIndex = event.newDraggableIndex
        this.moveSlimItem(id, newIndex, itemType)
      },
    })
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
}
