import { WILDSEA } from '../config.js'
import * as Dice from '../dice.js'

const blankPool = {
  skill: '',
  advantage: 0,
  cut: 0,
}

export default class WildseaDicePool extends FormApplication {
  constructor() {
    super()
    this.dicePool = { ...blankPool }
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'user-dice-pool',
      template: 'systems/wild-steppe/templates/applications/dice_pool.hbs',
      title: game.i18n.localize('wildsea.dicePoolTitle'),
      width: 400,
      height: 'auto',
      resizable: false,
      closeOnSubmit: false,
      submitOnClose: false,
      submitOnChange: true,
    })
  }

  async getData() {
    const context = { ...this.dicePool }
    context.config = WILDSEA

    this.actor = game.user.character?.uuid
      ? await fromUuid(game.user.character?.uuid)
      : null

    if (!this.actor) {
      const error = game.i18n.localize('wildsea.userNotFound')
      ui.notifications.error(error)
      // throw new Error(error)
      game.user.sheet.render(true)
      return
    }

    if (!this.actor.isOwner) {
      const error = game.i18n.localize('wildsea.userNotPermitted')
      ui.notifications.error(error)
      throw new Error(error)
    }

    const skillOptions = {}
    for (const skill of WILDSEA.skills) {
      skillOptions[`skills.${skill}`] = game.i18n.format('wildsea.diceRating', {
        label: game.i18n.localize(`wildsea.${skill}`),
        value: this.actor.system.skills[skill] || 0,
      })
    }
    context.skillOptions = skillOptions

    context.advantageOptions = Object.fromEntries(
      [0, 1, 2, 3].map((n) => [n, `+${n}d`]),
    )

    context.cutOptions = Object.fromEntries(
      [0, 1, 2, 3].map((n) => [n, `${n}d`]),
    )

    return context
  }

  activateListeners(html) {
    html.find('.submit').click(this.handleSubmit.bind(this))
    html.find('.cancel').click(this.handleCancel.bind(this))

    super.activateListeners(html)
  }

  async toggle() {
    if (!this.rendered) {
      await this.render(true)
    } else {
      this.close()
    }
  }

  _updateObject(event, formData) {
    event.preventDefault()
    this.dicePool = {
      ...this.dicePool,
      ...formData,
    }
  }

  handleSubmit(event) {
    event.preventDefault()
    this.doRoll({ ...this.dicePool })
    this.close()
    this.dicePool = { ...blankPool }
  }

  handleCancel(event) {
    event.preventDefault()
    this.close()
  }

  async doRoll(dicePool) {
    const system = this.actor.system

    const [skillType, skillKey] = dicePool.skill.split('.')
    dicePool.skillType = skillType.slice(0, -1)
    dicePool.skillKey = skillKey
    dicePool.skillDice = system[skillType]?.[skillKey] || 0
    dicePool.advantageDice = parseInt(dicePool.advantage)

    const [roll, outcome] = await Dice.rollPool(dicePool)

    const chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: await renderTemplate(
        'systems/wild-steppe/templates/chat/roll.hbs',
        outcome,
      ),
      roll,
      rolls: [roll],
      sound: CONFIG.sounds.dice,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    }
    ChatMessage.create(chatData)
  }

  async setSkill(skill) {
    this.dicePool.skill = `skills.${skill}`
    this.render(true)
  }
}
