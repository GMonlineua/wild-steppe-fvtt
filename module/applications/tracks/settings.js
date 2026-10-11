export const registerWildsteppeTrackSettings = () => {
  game.settings.register('wildsteppe', 'activeTracks', {
    name: 'Active Tracks',
    scope: 'world',
    type: Object,
    default: {},
    config: false,
    onChange: () => game.wildsteppe.trackDatabase.refresh(),
  })

  game.settings.register('wildsteppe', 'trackPosition', {
    config: true,
    scope: 'world',
    name: 'SETTINGS.trackPosition.label',
    hint: 'SETTINGS.trackPosition.hint',
    type: String,
    choices: {
      bottom: 'SETTINGS.trackPosition.bottom',
      top: 'SETTINGS.trackPosition.top',
    },
    default: 'top',
    requiresReload: true,
  })
}
