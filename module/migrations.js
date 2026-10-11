export const runMigrations = () => {
  if (!game.user.isGM) return

  const currentVersion = game.settings.get('wildsteppe', 'systemMigrationVersion')
  const NEEDS_MIGRATION_VERSION = '0.0.8'

  const needsMigration =
    !currentVersion ||
    foundry.utils.isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion)

  if (needsMigration) {
    migrate()
    game.settings.set(
      'wildsteppe',
      'systemMigrationVersion',
      NEEDS_MIGRATION_VERSION,
    )
  }
}

const migrate = () => {
  const tracks = game.settings.get('wildsteppe', 'activeTracks')
  for (const track of Object.values(tracks)) {
    track.visibility = track.firefly ? 'secret' : 'open'
    tracks[track.id] = track
  }

  game.settings.set('wildsteppe', 'activeTracks', tracks)
}
