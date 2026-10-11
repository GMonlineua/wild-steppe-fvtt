import { registerWildsteppeTrackSettings } from './settings.js'
import { WildsteppeTrackDatabase } from './db.js'
import { WildsteppeTrackPanel } from './panel.js'

export const setup = () => {
  registerWildsteppeTrackSettings()
  game.wildsteppe.trackDatabase = new WildsteppeTrackDatabase()
  game.wildsteppe.trackPanel = new WildsteppeTrackPanel(game.wildsteppe.trackDatabase)
  game.wildsteppe.trackDatabase.refresh()
  const top = document.querySelector('#ui-top')
  if (top) {
    const template = document.createElement('template')
    template.setAttribute('id', 'wildsteppe-tracks-panel')
    top?.insertAdjacentElement('afterend', template)
  }

  Handlebars.registerHelper('renderTrack', (track) => track.render())

  Hooks.on('canvasReady', () => {
    game.wildsteppe.trackPanel.render(true)
  })

  Hooks.on('createSetting', (setting) => {
    if (setting.key === 'wildsteppe.activeTracks') {
      game.wildsteppe.trackDatabase.refresh()
    }
  })
}
