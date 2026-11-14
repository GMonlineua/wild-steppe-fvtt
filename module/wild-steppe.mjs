import { WILDSTEPPE, registerSystemSettings } from './config.js'
import {
  loadHandlebarsHelpers,
  loadHandlebarsPartials,
} from './preload.js'
import WildsteppeActor from './actor.js'
import { addDiceColor } from './dice.js'
import WildsteppeAspectSheet from './sheets/aspect.js'
import WildsteppeFactionSheet from './sheets/faction.js'
import WildsteppeDicePool from './applications/dice_pool.js'
import WildsteppeItem from './item.js'
import WildsteppeJournalSheet from './sheets/journal.js'
import WildsteppePlayerSheet from './sheets/player.js'
import WildsteppeResourceSheet from './sheets/resource.js'
import WildsteppeShipSheet from './sheets/ship.js'
import WildsteppeShipItemSheet from './sheets/ship_item.js'
import { setupEnrichers } from './enrichers.js'

import * as WildsteppeTracks from './applications/tracks/index.js'

Hooks.once('init', () => {
  console.log('wildsteppe | Initializing')

  registerSystemSettings()

  CONFIG.wildsteppe = WILDSTEPPE
  CONFIG.ActiveEffect.legacyTransferral = false
  game.wildsteppe = {}

  WildsteppeTracks.setup()

  loadHandlebarsPartials()
  loadHandlebarsHelpers()
  setupEnrichers()

  CONFIG.Actor.documentClass = WildsteppeActor
  CONFIG.Item.documentClass = WildsteppeItem

  foundry.documents.collections.Actors.unregisterSheet('core', foundry.appv1.sheets.ActorSheet)
  foundry.documents.collections.Actors.registerSheet('wildsteppe', WildsteppePlayerSheet, { types: ['player'] })
  foundry.documents.collections.Actors.registerSheet('wildsteppe', WildsteppeShipSheet, { types: ['ship'] })

  foundry.documents.collections.Items.unregisterSheet('core', foundry.appv1.sheets.ItemSheet)
  foundry.documents.collections.Items.registerSheet('wildsteppe', WildsteppeAspectSheet, {
    types: ['aspect', 'temporaryAspect'],
  })
  foundry.documents.collections.Items.registerSheet('wildsteppe', WildsteppeFactionSheet, {
    types: ['faction', 'temporaryAspect'],
  })
  foundry.documents.collections.Items.registerSheet('wildsteppe', WildsteppeResourceSheet, { types: ['resource'] })

  foundry.documents.collections.Journal.unregisterSheet('core', foundry.appv1.sheets.JournalSheet)
  foundry.documents.collections.Journal.registerSheet('wildsteppe', WildsteppeJournalSheet)
})

Hooks.on('ready', async () => {
  game.wildsteppe.dicePool = new WildsteppeDicePool()
})

Hooks.on('renderJournalPageSheet', (_obj, html) => {
  html = $(html)
  if (game.user.isGM) {
    html.on('click', '.track', async (event) => {
      const data = event.currentTarget.dataset
      console.log(data)

      const result = await game.wildsteppe.trackDatabase.showTrackDialog(
        'wildsteppe.TRACKS.addTrack',
        data,
      )
      if (result.cancelled) return
      game.wildsteppe.trackDatabase.addTrack({ ...result })
    })
  }
})

Hooks.on('renderSceneControls', (_controls, html) => {
  html = $(html)
  const dicePoolButton = $(
    `<li class="dice-pool-control" data-control="dice-pool" data-tooltip="${game.i18n.localize(
      'wildsteppe.dicePoolTitle',
    )}">
        <i class="fas fa-dice"></i>
        <ol class="control-tools">
        </ol>
    </li>`,
  )

  html.find('.main-controls').append(dicePoolButton)
  html
    .find('.dice-pool-control')
    .removeClass('control-tool')
    .on('click', async () => {
      await game.wildsteppe.dicePool.toggle()
    })
})
