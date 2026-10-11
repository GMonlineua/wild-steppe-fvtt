export const WILDSTEPPE = {}
WILDSTEPPE.root_path = 'systems/wild-steppe'
WILDSTEPPE.defaultTokens = {
  player: `${WILDSTEPPE.root_path}/assets/tokens/person.png`,
  ship: `${WILDSTEPPE.root_path}/assets/tokens/iron-hulled-warship.png`,
}
WILDSTEPPE.knowledgeMax = 3
WILDSTEPPE.knowledges = [
  'steppe',
  'ruin',
  'old'
]
WILDSTEPPE.resourceTypes = ['equipment', 'salvage', 'chart']
WILDSTEPPE.shipRatings = ['armour', 'speed', 'resources', 'team', 'danger']
WILDSTEPPE.counters = ['steppe', 'ruin']
WILDSTEPPE.skillMax = 3
WILDSTEPPE.skills = [
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
WILDSTEPPE.trackVisibilityOptions = {
  open: 'wildsteppe.TRACKS.open',
  hidden: 'wildsteppe.TRACKS.hidden',
  secret: 'wildsteppe.TRACKS.secret',
}

export const registerSystemSettings = () => {
  game.settings.register('wildsteppe', 'showBurnTooltip', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.showBurnTooltip.label',
    hint: 'SETTINGS.showBurnTooltip.hint',
    type: Boolean,
    default: true,
  })

  game.settings.register('wildsteppe', 'showAttributeTooltip', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.showAttributeTooltip.label',
    hint: 'SETTINGS.showAttributeTooltip.hint',
    type: Boolean,
    default: true,
  })

  game.settings.register('wildsteppe', 'showDepth', {
    config: true,
    scope: 'world',
    name: 'SETTINGS.showDepth.label',
    hint: 'SETTINGS.showDepth.hint',
    type: Boolean,
    default: false,
    requiresReload: true,
  })

  game.settings.register('wildsteppe', 'systemMigrationVersion', {
    config: false,
    scope: 'world',
    type: String,
    default: '',
  })
}
