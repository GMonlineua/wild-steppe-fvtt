import { registerWildseaTrackSettings } from './settings.js'
import { WildseaTrackDatabase } from './db.js'
import { WildseaTrackPanel } from './panel.js'

export const setup = () => {
  registerWildseaTrackSettings()
  game.wildsea.trackDatabase = new WildseaTrackDatabase()
  game.wildsea.trackPanel = new WildseaTrackPanel(game.wildsea.trackDatabase)
  game.wildsea.trackDatabase.refresh()
  const top = document.querySelector('#ui-top')
  if (top) {
    const template = document.createElement('template')
    template.setAttribute('id', 'wildsea-tracks-panel')
    top?.insertAdjacentElement('afterend', template)
  }

  Handlebars.registerHelper('renderTrack', (track) => track.render())

  Hooks.on('canvasReady', () => {
    game.wildsea.trackPanel.render(true)
  })

  Hooks.on('createSetting', (setting) => {
    if (setting.key === 'wildsea.activeTracks') {
      game.wildsea.trackDatabase.refresh()
    }
  })
}
