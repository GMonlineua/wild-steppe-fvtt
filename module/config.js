export const WILDSEA = {}
WILDSEA.root_path = 'systems/wild-steppe'
WILDSEA.defaultTokens = {
  player: `${WILDSEA.root_path}/assets/tokens/person.png`,
  ship: `${WILDSEA.root_path}/assets/tokens/iron-hulled-warship.png`,
}
WILDSEA.knowledgeMax = 3
WILDSEA.knowledges = [
  'steppe',
  'ruin',
  'old'
]
WILDSEA.resourceTypes = ['equipment', 'salvage', 'chart']
WILDSEA.shipRatings = ['armour', 'speed', 'resources', 'team', 'danger']
WILDSEA.counters = ['steppe', 'ruin']
WILDSEA.skillMax = 3
WILDSEA.skills = [
  'athletics',
  'artistry',
  'trick',
  'will',
  'combat',
  'care',
  'research',
  'cooking',
  'manipulation',
  'hunting',
  'craft',
  'sense',
]
WILDSEA.trackVisibilityOptions = {
  open: 'wildsea.TRACKS.open',
  hidden: 'wildsea.TRACKS.hidden',
  secret: 'wildsea.TRACKS.secret',
}

export const registerSystemSettings = () => {
  game.settings.register('wildsea', 'showBurnTooltip', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.showBurnTooltip.label',
    hint: 'SETTINGS.showBurnTooltip.hint',
    type: Boolean,
    default: true,
  })

  game.settings.register('wildsea', 'showAttributeTooltip', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.showAttributeTooltip.label',
    hint: 'SETTINGS.showAttributeTooltip.hint',
    type: Boolean,
    default: true,
  })

  game.settings.register('wildsea', 'showDepth', {
    config: true,
    scope: 'world',
    name: 'SETTINGS.showDepth.label',
    hint: 'SETTINGS.showDepth.hint',
    type: Boolean,
    default: false,
    requiresReload: true,
  })

  game.settings.register('wildsea', 'systemMigrationVersion', {
    config: false,
    scope: 'world',
    type: String,
    default: '',
  })
}
