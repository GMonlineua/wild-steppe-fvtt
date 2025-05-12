import { WILDSEA, registerSystemSettings } from './config.js'
import {
  loadHandlebarsHelpers,
  loadHandlebarsPartials,
} from './preload.js'
import WildseaActor from './actor.js'
import { addDiceColor } from './dice.js'
import WildseaAspectSheet from './sheets/aspect.js'
import WildseaAttributeSheet from './sheets/attribute.js'
import WildseaDicePool from './applications/dice_pool.js'
import WildseaItem from './item.js'
import WildseaJournalSheet from './sheets/journal.js'
import WildseaPlayerSheet from './sheets/player.js'
import WildseaResourceSheet from './sheets/resource.js'
import WildseaShipSheet from './sheets/ship.js'
import WildseaShipItemSheet from './sheets/ship_item.js'
import { setupEnrichers } from './enrichers.js'
import { runMigrations } from './migrations.js'

import * as WildseaTracks from './applications/tracks/index.js'

Hooks.once('init', () => {
  console.log('wildsea | Initializing')

  registerSystemSettings()

  if (game.settings.get('wildsea', 'showDepth'))
    WILDSEA.shipRatings.push('depth')

  CONFIG.wildsea = WILDSEA
  CONFIG.ActiveEffect.legacyTransferral = false
  game.wildsea = {}

  WildseaTracks.setup()

  loadHandlebarsPartials()
  loadHandlebarsHelpers()
  setupEnrichers()

  CONFIG.Actor.documentClass = WildseaActor
  CONFIG.Item.documentClass = WildseaItem

  Actors.unregisterSheet('core', ActorSheet)
  Actors.registerSheet('wildsea', WildseaPlayerSheet, { types: ['player'] })
  Actors.registerSheet('wildsea', WildseaShipSheet, { types: ['ship'] })

  Items.unregisterSheet('core', ItemSheet)
  Items.registerSheet('wildsea', WildseaAspectSheet, {
    types: ['aspect', 'temporaryTrack'],
  })
  Items.registerSheet('wildsea', WildseaResourceSheet, { types: ['resource'] })
  Items.registerSheet('wildsea', WildseaShipItemSheet, {
    types: ['design', 'fitting', 'undercrew'],
  })
  Items.registerSheet('wildsea', WildseaAttributeSheet, {
    types: ['attribute'],
  })

  Journal.unregisterSheet('core', JournalSheet)
  Journal.registerSheet('wildsea', WildseaJournalSheet)

  CONFIG.TinyMCE.content_css = `${WILDSEA.root_path}/styles/tinymce.css`
})

Hooks.once('ready', () => {
  runMigrations()
})

Hooks.on('ready', async () => {
  game.wildsea.dicePool = new WildseaDicePool()
})

Hooks.on('renderJournalPageSheet', (_obj, html) => {
  if (game.user.isGM) {
    html.on('click', '.track', async (event) => {
      const data = event.currentTarget.dataset
      console.log(data)

      const result = await game.wildsea.trackDatabase.showTrackDialog(
        'wildsea.TRACKS.addTrack',
        data,
      )
      if (result.cancelled) return
      game.wildsea.trackDatabase.addTrack({ ...result })
    })
  }
})

Hooks.on('renderSceneControls', (_controls, html) => {
  const dicePoolButton = $(
    `<li class="dice-pool-control" data-control="dice-pool" data-tooltip="${game.i18n.localize(
      'wildsea.dicePoolTitle',
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
      await game.wildsea.dicePool.toggle()
    })
})

Hooks.once('diceSoNiceReady', (dice3d) => {
  const dark = '#2e2c20'
  const mid = '#626256'
  const light = '#858778'

  addDiceColor(dice3d, 'wildsea-dark', 'Dark', dark)
  addDiceColor(dice3d, 'wildsea-mid', 'Mid', mid)
  addDiceColor(dice3d, 'wildsea-light', 'Light', light)
})
