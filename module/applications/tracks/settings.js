export const registerWildseaTrackSettings = () => {
  game.settings.register('wildsea', 'activeTracks', {
    name: 'Active Tracks',
    scope: 'world',
    type: Object,
    default: {},
    config: false,
    onChange: () => game.wildsea.trackDatabase.refresh(),
  })

  game.settings.register('wildsea', 'trackPosition', {
    config: true,
    scope: 'world',
    name: 'SETTINGS.trackPosition.label',
    hint: 'SETTINGS.trackPosition.hint',
    type: String,
    choices: {
      bottom: 'SETTINGS.trackPosition.bottom',
      top: 'SETTINGS.trackPosition.top',
    },
    default: 'bottom',
    requiresReload: true,
  })
}
